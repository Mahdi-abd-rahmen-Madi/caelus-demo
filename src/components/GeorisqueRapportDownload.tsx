import {
  Description,
  Download,
  Error as ErrorIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Tooltip,
  Typography
} from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAppState } from '../context/AppStateContext';
import { PreconnectionStatus, georisquesPreconnection } from '../services/preconnection';
import { preconnectionMonitor } from '../services/preconnection-monitor';

interface GeorisqueRapportDownloadProps {
  longitude?: number;
  latitude?: number;
  visible?: boolean;
}

const GeorisqueRapportDownload: React.FC<GeorisqueRapportDownloadProps> = ({
  longitude,
  latitude,
  visible = false
}) => {
  const { t } = useTranslation();
  const { state: { dvfPopupOpen, dvfTransactionListShown } } = useAppState();
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // Hide component when DVF popup is open and transaction list is shown
  const shouldHide = dvfPopupOpen && dvfTransactionListShown;

  const handleDownload = async () => {
    if (!longitude || !latitude) {
      setError(t('invalid_coordinates'));
      setShowError(true);
      return;
    }

    setIsDownloading(true);
    setError(null);

    // Start monitoring for this API call and download attempt
    preconnectionMonitor.startApiCall();
    preconnectionMonitor.recordDownloadAttempt();

    try {
      // Check and trigger preconnection if needed for optimal performance
      const preconnectionStatus = georisquesPreconnection.getStatus();
      if (preconnectionStatus === PreconnectionStatus.IDLE) {
        console.log('Triggering preconnection for Georisques PDF download...');
        await georisquesPreconnection.performHealthCheck().catch(() => {
          // Health check failed, but we'll proceed anyway
          console.warn('Preconnection health check failed, proceeding with download');
        });
      }

      // Format coordinates as required by Georisque API: longitude,latitude
      const coordinates = `${longitude},${latitude}`;
      const apiUrl = `https://georisques.gouv.fr/api/v1/rapport_pdf?latlon=${coordinates}`;

      console.log('Downloading rapport from:', apiUrl);
      console.log('Preconnection status:', georisquesPreconnection.getStatus());

      // Make the optimized request to Georisque API
      const response = await axios.get(apiUrl, {
        responseType: 'blob',
        timeout: 30000 // 30 second timeout
      });

      // Check if we got a PDF response
      const contentType = response.headers['content-type'];
      if (!contentType || typeof contentType !== 'string' || !contentType.includes('application/pdf')) {
        throw new Error(t('no_pdf_available'));
      }

      // Create blob from response data
      const blob = new Blob([response.data], { type: 'application/pdf' });

      // Create download URL
      const url = window.URL.createObjectURL(blob);

      // Create temporary link element for download
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with coordinates and timestamp
      const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      link.download = `rapport_georisque_${latitude.toFixed(4)}_${longitude.toFixed(4)}_${timestamp}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Show success message
      toast.success(t('rapport_downloaded_successfully'));

      // Record successful API call and download
      preconnectionMonitor.endApiCall(true, false);
      preconnectionMonitor.recordDownloadSuccess();

    } catch (error) {
      console.error('Error downloading rapport:', error);

      let errorMessage = t('download_failed');

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          // Check if preconnection was active for better error context
          const preconnectionStatus = georisquesPreconnection.getStatus();
          if (preconnectionStatus !== PreconnectionStatus.CONNECTED) {
            errorMessage = t('download_timeout_preconnection_failed') || 'Download timeout - connection issue';
          } else {
            errorMessage = t('download_timeout_server_issue') || 'Download timeout - server issue';
          }
        } else if (error.response?.status === 404) {
          errorMessage = t('no_rapport_found');
        } else if (error.response?.status === 429) {
          errorMessage = t('too_many_requests');
        } else if ((error.response?.status ?? 0) >= 500) {
          errorMessage = t('server_error');
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      // Record failed API call and download
      preconnectionMonitor.endApiCall(false, false);
      preconnectionMonitor.recordDownloadFailure();

      setError(errorMessage);
      setShowError(true);
      toast.error(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCloseError = () => {
    setShowError(false);
    setError(null);
  };

  if (!visible || !longitude || !latitude) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          top: 90, // Position under DVFPopup (20 + 200 height)
          left: 20,
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: 1.5,
          boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          border: '1px solid #e2e8f0',
          p: 1.5,
          width: 400,
          maxWidth: 400,
          transform: shouldHide ? 'translateX(-450px)' : 'translateX(0)',
          opacity: shouldHide ? 0 : 1,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: shouldHide ? 'none' : 'auto'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Description sx={{ fontSize: 16, color: '#1976d2' }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>
            {t('environmental_rapport')}
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.7rem', display: 'block' }}>
          {t('download_rapport_for_coordinates')}
          <br />
          <span style={{ fontSize: '0.65rem' }}>
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </span>
        </Typography>

        <Tooltip title={t('download_georisque_rapport')} arrow>
          <Button
            variant="contained"
            size="small"
            startIcon={
              isDownloading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <Download sx={{ fontSize: 16 }} />
              )
            }
            onClick={handleDownload}
            disabled={isDownloading}
            fullWidth
            sx={{
              backgroundColor: '#1976d2',
              fontSize: '0.75rem',
              py: 0.5,
              minHeight: 32,
              '&:hover': {
                backgroundColor: '#1565c0'
              },
              '&:disabled': {
                backgroundColor: '#94a3b8'
              }
            }}
          >
            {isDownloading ? t('downloading') : t('download_rapport')}
          </Button>
        </Tooltip>
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseError}
          severity="error"
          sx={{ width: '100%' }}
          icon={<ErrorIcon fontSize="small" />}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GeorisqueRapportDownload;
