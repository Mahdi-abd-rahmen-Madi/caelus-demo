import {
    Apartment as ApartmentIcon,
    Business as BusinessIcon,
    ExpandLess,
    ExpandMore,
    Home as HomeIcon,
    Landscape as LandscapeIcon,
    Refresh as RefreshIcon,
    SquareFoot as SquareFootIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    IconButton,
    Skeleton,
    Tooltip,
    Typography,
    alpha
} from '@mui/material';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { DVFResponse } from '../services/api';
import { getDVFTransactions } from '../services/api';

interface DVFTransactionListProps {
    parcelId: string;
    onTransactionCountChange?: (count: number) => void;
    autoCollapse?: boolean;
}

const DVFTransactionList: React.FC<DVFTransactionListProps> = ({ 
    parcelId, 
    onTransactionCountChange,
    autoCollapse = true 
}) => {
    const { t } = useTranslation();
    const [dvfData, setDvfData] = useState<DVFResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const onTransactionCountChangeRef = useRef(onTransactionCountChange);
    onTransactionCountChangeRef.current = onTransactionCountChange;
    
    const fetchDVFData = useCallback(async () => {
        if (!parcelId) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await getDVFTransactions(parcelId);
            
            if (response.error) {
                setError(response.error);
                setDvfData(null);
                onTransactionCountChangeRef.current?.(0);
                if (autoCollapse) {
                    setIsExpanded(false);
                }
            } else {
                setDvfData(response);
                onTransactionCountChangeRef.current?.(response.total_count);
                // Auto-expand if there are transactions, auto-collapse if none
                if (autoCollapse) {
                    setIsExpanded(response.total_count > 0);
                }
            }
        } catch (err) {
            setError('fetch_error');
            setDvfData(null);
            onTransactionCountChangeRef.current?.(0);
            if (autoCollapse) {
                setIsExpanded(false);
            }
        } finally {
            setIsLoading(false);
        }
    }, [parcelId, autoCollapse]);

    // Handle error message translation
    useEffect(() => {
        if (error === 'fetch_error') {
            setError(t('dvf.error.fetch'));
        } else if (error && !error.includes('dvf.error.')) {
            setError(error || t('dvf.error.unknown'));
        }
    }, [error, t]);

    useEffect(() => {
        fetchDVFData();
    }, [fetchDVFData]);

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null || amount === undefined) return t('dvf.not_specified');
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const getNatureMutationLabel = (nature: string) => {
        const labels: Record<string, string> = {
            'Vente': t('dvf.nature.sale'),
            'Echange': t('dvf.nature.exchange'),
            'Donation': t('dvf.nature.donation'),
            'Succession': t('dvf.nature.inheritance'),
            'Adjudication': t('dvf.nature.adjudication')
        };
        return labels[nature] || nature;
    };

    const getTypeLocalLabel = (type: string | null) => {
        if (!type) return t('dvf.type.land');
        const labels: Record<string, string> = {
            'Maison': t('dvf.type.house'),
            'Appartement': t('dvf.type.apartment'),
            'Dépendance': t('dvf.type.dependency'),
            'Local industriel': t('dvf.type.industrial'),
            'Local commercial': t('dvf.type.commercial')
        };
        return labels[type] || type;
    };

    const getPropertyTypeIcon = (type: string | null) => {
        if (!type) return <LandscapeIcon />;
        if (type.includes('Maison')) return <HomeIcon />;
        if (type.includes('Appartement')) return <ApartmentIcon />;
        if (type.includes('industriel') || type.includes('commercial')) return <BusinessIcon />;
        return <LandscapeIcon />;
    };

    const handleRefresh = () => {
        fetchDVFData();
    };

    const handleToggleExpand = () => {
        setIsExpanded(prev => !prev);
    };

    if (isLoading) {
        return (
            <Card sx={{ mb: 2, width: 400, maxWidth: 400, overflow: 'hidden' }}>
                <CardContent sx={{ p: 2, overflow: 'hidden', height: 'calc(100vh - 200px)', maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom>
                        {t('dvf.title')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Skeleton variant="rectangular" width={20} height={20} />
                        <Skeleton variant="text" width={120} height={20} />
                    </Box>
                    {[1, 2, 3].map((i) => (
                        <Box key={i} sx={{ mb: 2 }}>
                            <Skeleton variant="rectangular" width="100%" height={80} />
                        </Box>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card sx={{ mb: 2, width: 400, maxWidth: 400, overflow: 'hidden' }}>
                <CardContent sx={{ p: 2, overflow: 'hidden', height: 'calc(100vh - 200px)', maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography variant="h6">
                            {t('dvf.title')}
                        </Typography>
                        <Tooltip title={t('dvf.refresh')}>
                            <IconButton size="small" onClick={handleRefresh}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    if (!dvfData || dvfData.transactions.length === 0) {
        return (
            <Card sx={{ mb: 2, width: 400, maxWidth: 400, overflow: 'hidden' }}>
                <CardContent sx={{ p: 2, overflow: 'hidden', height: 'calc(100vh - 200px)', maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">
                            {t('dvf.title')}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                                size="small" 
                                label="0 transactions"
                                color="default"
                                variant="filled"
                                sx={{ 
                                    fontWeight: 500,
                                    fontSize: '0.7rem',
                                    height: 24
                                }}
                            />
                            <Tooltip title={t('dvf.refresh')}>
                                <IconButton size="small" onClick={handleRefresh}>
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                            {autoCollapse && (
                                <Tooltip title={isExpanded ? 'Collapse' : 'Expand'}>
                                    <IconButton size="small" onClick={handleToggleExpand}>
                                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    </Box>
                    {isExpanded && (
                        <Alert severity="info">
                            {t('dvf.no_transactions')}
                        </Alert>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ mb: 2, width: 400, maxWidth: 400, overflow: 'hidden' }}>
            <CardContent sx={{ p: 2, overflow: 'hidden', height: 'calc(100vh - 200px)', maxHeight: '600px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexShrink: 0 }}>
                    <Typography variant="h6">
                        {t('dvf.title')}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                            size="small" 
                            label={`${dvfData.total_count} ${t('dvf_transactions')}`}
                            color="primary"
                            variant="filled"
                            sx={{ 
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                height: 24
                            }}
                        />
                        <Tooltip title={t('dvf.refresh')}>
                            <IconButton size="small" onClick={handleRefresh}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflow: 'auto', flex: 1, pr: 1 }}>
                    {dvfData.transactions.map((transaction, index) => (
                        <Box 
                            key={`${transaction.id_mutation}-${index}`} 
                            sx={{
                                p: 1.5,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                backgroundColor: 'background.paper',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: alpha('#000', 0.02),
                                    borderColor: 'primary.main',
                                    boxShadow: 1
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body1" color="primary.main" fontWeight={600} mb={0.5}>
                                        {formatCurrency(transaction.valeur_fonciere)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                        {getNatureMutationLabel(transaction.nature_mutation)}
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right', ml: 2 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                        {formatDate(transaction.date_mutation)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1, alignItems: 'flex-start' }}>
                                {transaction.type_local && (
                                    <Chip
                                        size="small"
                                        icon={getPropertyTypeIcon(transaction.type_local)}
                                        label={getTypeLocalLabel(transaction.type_local)}
                                        variant="filled"
                                        color="primary"
                                        sx={{ 
                                            fontWeight: 500,
                                            fontSize: '0.7rem',
                                            height: 24,
                                            maxWidth: '100%',
                                            '& .MuiChip-label': {
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            },
                                            '& .MuiChip-icon': {
                                                fontSize: 16
                                            }
                                        }}
                                    />
                                )}
                                {transaction.surface_reelle_bati && (
                                    <Chip
                                        size="small"
                                        icon={<SquareFootIcon />}
                                        label={`${transaction.surface_reelle_bati} m²`}
                                        variant="filled"
                                        color="secondary"
                                        sx={{ 
                                            fontWeight: 500,
                                            fontSize: '0.7rem',
                                            height: 24,
                                            maxWidth: '100%',
                                            '& .MuiChip-label': {
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            },
                                            '& .MuiChip-icon': {
                                                fontSize: 16
                                            }
                                        }}
                                    />
                                )}
                                {transaction.surface_terrain && (
                                    <Chip
                                        size="small"
                                        icon={<SquareFootIcon />}
                                        label={`${transaction.surface_terrain} m²`}
                                        variant="filled"
                                        color="success"
                                        sx={{ 
                                            fontWeight: 500,
                                            fontSize: '0.7rem',
                                            height: 24,
                                            maxWidth: '100%',
                                            '& .MuiChip-label': {
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            },
                                            '& .MuiChip-icon': {
                                                fontSize: 16
                                            }
                                        }}
                                    />
                                )}
                            </Box>

                            {(transaction.adresse_numero || transaction.adresse_nom_voie) && (
                                <Box sx={{ mb: 0.5, overflow: 'hidden' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                        {transaction.adresse_numero && `${transaction.adresse_numero} `}
                                        {transaction.adresse_nom_voie}
                                        {transaction.code_postal && `, ${transaction.code_postal}`}
                                    </Typography>
                                </Box>
                            )}

                            {transaction.nom_commune && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                    {transaction.nom_commune}
                                </Typography>
                            )}
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};

export default memo(DVFTransactionList);
