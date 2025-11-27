const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

// Get all tags
router.get('/', requireAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .order('name');

        if (error) throw error;

        res.json({ success: true, tags: data });
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch tags' });
    }
});

// Create a new tag
router.post('/', requireAuth, async (req, res) => {
    try {
        const { name, color } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, error: 'Tag name is required' });
        }

        const { data, error } = await supabase
            .from('tags')
            .insert([{ name, color: color || 'bg-slate-500' }])
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, tag: data });
    } catch (error) {
        console.error('Error creating tag:', error);
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ success: false, error: 'Tag already exists' });
        }
        res.status(500).json({ success: false, error: 'Failed to create tag' });
    }
});

// Delete a tag
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('tags')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting tag:', error);
        res.status(500).json({ success: false, error: 'Failed to delete tag' });
    }
});

module.exports = router;
