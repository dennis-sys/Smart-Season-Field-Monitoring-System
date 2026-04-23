import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { computeStatus } from '../utils/statusLogic.js';

const router = Router();

const getSupabase = () => createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/fields - List fields (role-based filtering)
router.get('/', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabase();
    let query = supabase.from('fields').select(`
      *,
      profiles!fields_assigned_agent_id_fkey (full_name, role)
    `);
    
    // Field agents only see their assigned fields
    if (req.user.role === 'field_agent') {
      query = query.eq('assigned_agent_id', req.user.id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    // Compute status for each field
    const fieldsWithStatus = data.map(field => ({
      ...field,
      status: computeStatus(field)
    }));

    res.json(fieldsWithStatus);
  } catch (err) {
    console.error('Get fields error:', err);
    res.status(500).json({ error: 'Failed to fetch fields' });
  }
});

// GET /api/fields/:id - Get single field with updates
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const supabase = getSupabase();
    
    // Get field details
    const { data: field, error: fieldError } = await supabase
      .from('fields')
      .select(`
        *,
        profiles!fields_assigned_agent_id_fkey (full_name)
      `)
      .eq('id', req.params.id)
      .single();
    
    if (fieldError || !field) throw new Error('Field not found');

    // Permission check: agents can only view their assigned fields
    if (req.user.role === 'field_agent' && field.assigned_agent_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get update history
    const { data: updates } = await supabase
      .from('field_updates')
      .select(`
        *,
        profiles!field_updates_agent_id_fkey (full_name)
      `)
      .eq('field_id', req.params.id)
      .order('created_at', { ascending: false });

    res.json({
      ...field,
      status: computeStatus(field),
      updates: updates || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/fields - Create new field (Admin only)
router.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { name, crop_type, planting_date, assigned_agent_id } = req.body;
    
    if (!name || !crop_type || !planting_date) {
      return res.status(400).json({ error: 'Name, crop type, and planting date are required' });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('fields')
      .insert([{ 
        name, 
        crop_type, 
        planting_date, 
        assigned_agent_id,
        current_stage: 'Planted' // Default starting stage
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    res.status(201).json({ ...data, status: computeStatus(data) });
  } catch (err) {
    console.error('Create field error:', err);
    res.status(500).json({ error: 'Failed to create field' });
  }
});

// PATCH /api/fields/:id - Update field details (Admin only)
router.patch('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const { name, crop_type, planting_date, assigned_agent_id, current_stage } = req.body;
    const supabase = getSupabase();
    
    const updates = {};
    if (name) updates.name = name;
    if (crop_type) updates.crop_type = crop_type;
    if (planting_date) updates.planting_date = planting_date;
    if (assigned_agent_id) updates.assigned_agent_id = assigned_agent_id;
    if (current_stage) {
      updates.current_stage = current_stage;
      updates.last_update_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('fields')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
      
    if (error) throw error;
    
    res.json({ ...data, status: computeStatus(data) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/fields/:id/stage - Update stage with notes (Field Agents + Admins)
router.patch('/:id/stage', requireAuth, async (req, res) => {
  try {
    const { new_stage, notes } = req.body;
    const supabase = getSupabase();
    
    // Validate stage
    const validStages = ['Planted', 'Growing', 'Ready', 'Harvested'];
    if (!validStages.includes(new_stage)) {
      return res.status(400).json({ error: 'Invalid stage value' });
    }
    
    // Get current field to check permissions
    const { data: field, error: fieldError } = await supabase
      .from('fields')
      .select('assigned_agent_id, current_stage')
      .eq('id', req.params.id)
      .single();
    
    if (fieldError || !field) {
      return res.status(404).json({ error: 'Field not found' });
    }
    
    // Permission: agents can only update their assigned fields
    if (req.user.role === 'field_agent' && field.assigned_agent_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this field' });
    }
    
    // Update the field
    const { error: updateError } = await supabase
      .from('fields')
      .update({ 
        current_stage: new_stage, 
        last_update_at: new Date().toISOString() 
      })
      .eq('id', req.params.id);
    
    if (updateError) throw updateError;

    // Log the update in field_updates table
    await supabase.from('field_updates').insert({
      field_id: req.params.id,
      agent_id: req.user.id,
      previous_stage: field.current_stage,
      new_stage: new_stage,
      notes: notes || null
    });

    // Return updated field
    const { data: updatedField } = await supabase
      .from('fields')
      .select('*')
      .eq('id', req.params.id)
      .single();

    res.json({ 
      success: true, 
      field: { ...updatedField, status: computeStatus(updatedField) } 
    });
  } catch (err) {
    console.error('Update stage error:', err);
    res.status(500).json({ error: 'Failed to update field stage' });
  }
});

// GET /api/fields/updates - Monitor all updates (Admin only)
router.get('/updates', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('field_updates')
      .select(`
        *,
        fields (name, crop_type),
        profiles!field_updates_agent_id_fkey (full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;