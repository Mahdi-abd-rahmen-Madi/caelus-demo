import {
    ExpandLess,
    ExpandMore,
    HomeWork,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    CircularProgress,
    Tooltip,
    Typography
} from '@mui/material';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppState } from '../context/AppStateContext';
import DVFTransactionList from './DVFTransactionList';

interface DVFPopupProps {
    parcelId?: string;
}

const DVFPopup: React.FC<DVFPopupProps> = ({ 
    parcelId
}) => {
    const { t } = useTranslation();
    const { setDvfPopupOpen, setDvfTransactionListShown } = useAppState();
    const [isMinimized, setIsMinimized] = useState(true);
    const [transactionCount, setTransactionCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleTransactionCountChange = useCallback((count: number) => {
        setTransactionCount(count);
        setIsLoading(false);
    }, []);

    const handleToggleMinimize = useCallback(() => {
        setIsMinimized(prev => !prev);
    }, []);

    const handleRefresh = useCallback(() => {
        setIsLoading(true);
        setRefreshKey(prev => prev + 1);
    }, []);

    // Update AppState when popup is open/closed
    useEffect(() => {
        const isOpen = !!parcelId;
        setDvfPopupOpen(isOpen);
        
        if (!isOpen) {
            setDvfTransactionListShown(false);
        }
    }, [parcelId, setDvfPopupOpen, setDvfTransactionListShown]);

    // Update AppState when transaction list is shown/hidden
    useEffect(() => {
        const isListShown = !isMinimized && !!parcelId;
        setDvfTransactionListShown(isListShown);
    }, [isMinimized, parcelId, setDvfTransactionListShown]);

    // Always visible now, just show placeholder when no parcel selected
    if (!parcelId) {
        return (
            <Box
                sx={{
                    position: 'absolute',
                    top: 20,
                    left: 20,
                    zIndex: 1000,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    border: '1px solid #e2e8f0',
                    width: 400,
                    maxWidth: 400,
                    padding: 2,
                    transition: 'all 0.3s ease-in-out'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HomeWork sx={{ fontSize: 20, color: '#1976d2' }} />
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                            {t('dvf')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            {t('dvf.placeholder')}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                position: 'absolute',
                top: 20, // Position where GeorisqueRapportDownload was
                left: 20,
                zIndex: 1000,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0',
                width: 400,
                maxWidth: 400,
                transition: 'all 0.3s ease-in-out'
            }}
        >
            <Accordion 
                expanded={!isMinimized}
                onChange={handleToggleMinimize}
                sx={{ 
                    boxShadow: 'none',
                    '&:before': { display: 'none' }
                }}
            >
                <AccordionSummary
                    sx={{
                        minHeight: 'auto !important',
                        '& .MuiAccordionSummary-content': {
                            margin: '8px 0 !important',
                            alignItems: 'center'
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <HomeWork sx={{ fontSize: 20, color: '#1976d2' }} />
                        
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.875rem' }}>
                                {t('dvf')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {transactionCount > 0 
                                    ? `${transactionCount} ${t('dvf_transactions')}`
                                    : t('dvf.no_transactions')
                                }
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {isLoading && (
                                <CircularProgress size={16} sx={{ color: '#1976d2' }} />
                            )}
                            
                            <Tooltip title={t('dvf.refresh')} arrow>
                                <Box 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRefresh();
                                    }}
                                    sx={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: 32,
                                        height: 32,
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        padding: 0.5,
                                        '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                                    }}
                                >
                                    <RefreshIcon sx={{ fontSize: 16 }} />
                                </Box>
                            </Tooltip>

                            {isMinimized ? (
                                <ExpandMore sx={{ fontSize: 20, color: '#64748b' }} />
                            ) : (
                                <ExpandLess sx={{ fontSize: 20, color: '#64748b' }} />
                            )}
                        </Box>
                    </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ padding: 0 }}>
                    <DVFTransactionList 
                        key={refreshKey}
                        parcelId={parcelId} 
                        onTransactionCountChange={handleTransactionCountChange}
                        autoCollapse={true}
                    />
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default memo(DVFPopup);
