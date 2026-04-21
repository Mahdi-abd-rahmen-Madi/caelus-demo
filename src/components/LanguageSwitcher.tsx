import React from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography
} from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { APP_CONFIG } from '../config/appConfig';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (event: any) => {
    const newLanguage = event.target.value as 'fr' | 'en';
    i18n.changeLanguage(newLanguage);
    
    // Persist language preference if enabled
    if (APP_CONFIG.i18n.persistLanguage) {
      localStorage.setItem('caelus_language', newLanguage);
    }
  };

  // Get current language from localStorage or i18n
  const currentLanguage = (localStorage.getItem('caelus_language') as 'fr' | 'en') || i18n.language;

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl size="small" fullWidth>
        <InputLabel 
          id="language-select-label"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            '&.Mui-focused': {
              color: '#6366f1'
            }
          }}
        >
          <LanguageIcon sx={{ fontSize: 16 }} />
          {t('language')}
        </InputLabel>
        <Select
          labelId="language-select-label"
          value={currentLanguage}
          onChange={handleLanguageChange}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LanguageIcon sx={{ fontSize: 16 }} />
              {t('language')}
            </Box>
          }
          sx={{
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(99, 102, 241, 0.3)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(99, 102, 241, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#6366f1',
            },
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }
          }}
        >
          {APP_CONFIG.i18n.supportedLanguages.map((lang) => (
            <MenuItem key={lang} value={lang}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">
                  {lang === 'fr' ? '🇫🇷' : '🇬🇧'} {t(lang === 'fr' ? 'french' : 'english')}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSwitcher;
