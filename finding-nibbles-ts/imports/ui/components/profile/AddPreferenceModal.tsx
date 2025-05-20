import React, { useState } from 'react';
import { Modal, Box, Typography, Button, TextField, Autocomplete } from '@mui/material';

// TODO: Replace with actual API call to fetch food preferences
const MOCK_PREFERENCES = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Halal',
  'Kosher',
  'Dairy-Free',
  'Nut-Free',
  'Pescatarian',
];

interface AddPreferenceModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (preference: string) => void;
  // Toggle to enable/disable select list and custom input
  enableSelectList?: boolean;
  enableCustomInput?: boolean;
}

export const AddPreferenceModal: React.FC<AddPreferenceModalProps> = ({
  open,
  onClose,
  onAdd,
  enableSelectList = true,
  enableCustomInput = true,
}) => {
  const [selectedPref, setSelectedPref] = useState<string | null>(null);
  const [customPref, setCustomPref] = useState('');

  const handleAdd = () => {
    if (enableSelectList && selectedPref) {
      onAdd(selectedPref);
      setSelectedPref(null);
      setCustomPref('');
      onClose();
      return;
    }
    if (enableCustomInput && customPref.trim()) {
      onAdd(customPref.trim());
      setSelectedPref(null);
      setCustomPref('');
      onClose();
      return;
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
          minWidth: 320,
          maxWidth: 400,
        }}
      >
        <Typography variant="h6" mb={2} fontWeight={600}>
          Add Food Preference
        </Typography>
        {enableSelectList && (
          <Autocomplete
            options={MOCK_PREFERENCES}
            value={selectedPref}
            onChange={(_, value) => setSelectedPref(value)}
            renderInput={(params) => (
              <TextField {...params} label="Select a preference" variant="outlined" fullWidth sx={{ mb: 2 }} />
            )}
            sx={{ mb: 2 }}
          />
        )}
        {enableCustomInput && (
          <TextField
            label="Or type your own"
            value={customPref}
            onChange={(e) => setCustomPref(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            disabled={!!selectedPref}
          />
        )}
        <Box display="flex" justifyContent="flex-end" gap={1}>
          <Button onClick={onClose} variant="outlined" color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            variant="contained"
            disabled={
              (enableSelectList && !selectedPref && (!enableCustomInput || !customPref.trim())) ||
              (enableCustomInput && !customPref.trim() && (!enableSelectList || !selectedPref))
            }
          >
            Add
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddPreferenceModal;
