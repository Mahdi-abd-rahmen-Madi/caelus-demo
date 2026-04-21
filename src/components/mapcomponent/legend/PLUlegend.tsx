import {
    Info,
    LegendToggle
} from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    Divider,
    Typography
} from '@mui/material';
import React, { memo } from 'react';
import type { ColorMode } from '../../../types/dashboard';

interface PLULegendProps {
  showPluZoning?: boolean;
  showPluInformation?: boolean;
  showPluPrescriptions?: boolean;
  colorMode?: ColorMode;
}

interface LegendItem {
  name: string;
  content: React.ReactNode;
  color: string;
}

const getPluPrescriptionsLegendContent = (showTitle = true) => {
  return (
    <Box>
      {showTitle && (
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Prescriptions
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Mixité sociale et fonctionnelle en zones urbaines ou à urbaniser */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, color: '#059669', ml: 1 }}>
            Mixité sociale et fonctionnelle en zones urbaines ou à urbaniser
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ml: 2 }}>
            {/* Diversité commerciale */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
                <Box
                  component="img"
                  src="/media/legend/prescription/DCP1.png"
                  alt="DCP1"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/DCP2.png"
                  alt="DCP2"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/DCP3.png"
                  alt="DCP3"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Diversité commerciale à protéger ou à développer</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/SPLMS.png"
                alt="SPLMS"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Secteur à programme de logements mixité sociale en zone U et AU</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/STML.png"
                alt="STML"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Secteur avec taille minimale des logements en zone U et AU</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/MVC.png"
                alt="MVC"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Majoration des volumes constructibles</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/SDMPR.png"
                alt="SDMPR"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Secteur à densité maximale pour les reconstructions ou aménagements de bâtiments existants</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/MDSD.png"
                alt="MDSD"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Mixité des destinations ou sous-destionations</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/RDERDC.png"
                alt="RDERDC"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Règles différenciées entre le rez-de-chausée et les étages supérieur de constructions</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/RELPAJL.png"
                alt="RELPAJL"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>réalisation d'espace libres, plantations, aires de jeux et de loisir</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/EVNPR.png"
                alt="EVNPR"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Espace verts non protégé à requalifier</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/PCAELD.png"
                alt="PCAELD"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Place, cour, ou autre espace libre à dominante minérale non protégé à requalifier</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/SDLTC.png"
                alt="SDLTC"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Secteur dans lequel toutes les constructions nouvelles de logements sont à usage exclusif de résidence principale</Typography>
            </Box>
          </Box>
        </Box>

        {/* Traitement environemental et paysager */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, color: '#059669', ml: 1 }}>
            Traitement environemental et paysager
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ml: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/EBC.png"
                alt="EBC"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Espace Boisé classé</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/EBCPC.png"
                alt="EBCPC"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Espace boisé classé à protéger ou conserver</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
                <Box
                  component="img"
                  src="/media/legend/prescription/traitement_environ/PBPE1.png"
                  alt="PBPE1"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/traitement_environ/PBPE2.png"
                  alt="PBPE2"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/traitement_environ/PBPE3.png"
                  alt="PBPE3"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Patrimoine bâti, paysager ou éléments de paysages à protéger pour des motifs d'ordre culturel, historique, architectural ou écologique</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/EIPP.png"
                alt="EIPP"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Elément intérieur particulier protégé, à conserver, restaurer et mettre en valeur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/EEPP.png"
                alt="EEPP"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Elément extérieur particulier protégé, à conserver, restaurer et mettre en valeur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/AROA.png"
                alt="AROA"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>arbre remarquable ou autre élément naturel protégé à conserver, restaurer et mettre en valeur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/PESP.png"
                alt="PESP"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Point d'eau ou source protégé à conserver, restaurer et mettre en valeur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/MSRM.png"
                alt="MSRM"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>soutènement, rempart ou mur de clôture protégée, à conserver, restaurer et mettre en valeur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/SCOA.png"
                alt="SCOA"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Séquence, composition, ordonnance architecturale ou urbaine protégée, à conserver, restaurer et mettre en valeur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/SNPFR.png"
                alt="SNPFR"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Séquence naturelle protégée (front rocheux, falaise, etc) à conserver, restaurer et mettre en valeur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/SCOV.png"
                alt="SCOV"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Séquence , composition ou ordonnance végétale d'ensemble protégée, à conserver, restaurer et mettre en valeur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/INBEL.png"
                alt="INBEL"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>immeuble non bâti ou espace libre non protégé soumis à des dispositions spécifiques ou des règles générales localisées</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/PESP1.png"
                alt="PESP1"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Passage d'eau souterrain protégé, à conserver, restaurer et mettre en valeur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
                <Box
                  component="img"
                  src="/media/legend/prescription/traitement_environ/UUPS1.png"
                  alt="UUPS1"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/traitement_environ/UUPS2.png"
                  alt="UUPS2"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Unité urbanistique ou paysagère soumise à des dispositions spécifiques</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/IB.png"
                alt="IB"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Immeuble bâti dont les parties intérieurs sont protégées en totalité, à conserver , restaurer et mettre en valeur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/IB1.png"
                alt="IB1"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Immeuble bâti dont les parties extérieurs sont protégées, à conserver, restaurer et mettre en valeur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/PJ.png"
                alt="PJ"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Parc ou jardins de pleine terre protégé, à conserver, restaurer et mettre en valeur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/ELD.png"
                alt="ELD"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Espace libre à dominante végétale, protégé à conserver, restaurer et mettre en valeur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/PCOA.png"
                alt="PCOA"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Place, cour ou autre espace libre à dominante minérale non protégé à requalifier</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/CERH.png"
                alt="CERH"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Cour d'eau, réseau hydraulique ou étendue aquatique protégé à conserver, restaurer et mettre en valeur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/IBNP.png"
                alt="IBNP"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Immeuble bâti non protégé soumis à des dispositions spécifques ou des règles générales localisées</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/TCNB.png"
                alt="TCNB"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>terrain cultivé ou non bâti à protéger en zone urbaine</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
                <Box
                  component="img"
                  src="/media/legend/prescription/traitement_environ/ECE1.png"
                  alt="ECE1"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/traitement_environ/ECE2.png"
                  alt="ECE2"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/traitement_environ/ECE3.png"
                  alt="ECE3"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Eléments de continuité écologique et trame verte et bleue</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/ERL.png"
                alt="ERL"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Espace remarquables du littoral</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/EPPEF.png"
                alt="EPPEF"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Exclusion protection de plans d'eau de faible importance</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/SDP.png"
                alt="SDP"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Secteur de dérogation aux protections des rives des plans d'eau en zone de montagne</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/EPMC.png"
                alt="EPMC"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Espaces, paysage et milieux caractéristiques du patrimoine naturel et culturel montagnard à préserver</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/TNMD.png"
                alt="TNMD"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Terre nécessaires au maintien et au développement des activités agricoles pastorales et forestières à préserver</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/CBPS.png"
                alt="CBPS"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Coefficient de biotope par surface</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/CEBA.png"
                alt="CEBA"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Constructibilité espace boisé antérieur au 20ème siècle</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/traitement_environ/ZERTC.png"
                alt="ZERTC"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Zone exposée au recul du trait de côte</Typography>
            </Box>
          </Box>
        </Box>

        {/* Qualité urbaine et architecturale */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, color: '#059669', ml: 1 }}>
            Qualité urbaine et architecturale
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ml: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/Qualité_urbaine/IPM.png"
                alt="IPM"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Immeuble ou partie d'immeuble dont la modification peut être imposée à l'occasion d'opérations d'aménagement publiques ou privées</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/Qualité_urbaine/SDR.png"
                alt="SDR"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Secteur avec disposition de reconstruction/démolition</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/Qualité_urbaine/IPMD.png"
                alt="IPMD"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Immeuble ou partie de l'immeuble dont la démolition peut être imposée à l'occasion d'opérations d'aménagement publiques ou privées</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
                <Box
                  component="img"
                  src="/media/legend/prescription/Qualité_urbaine/RIC1.png"
                  alt="RIC1"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/Qualité_urbaine/RIC2.png"
                  alt="RIC2"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Règles d'implantation des constructions</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
                <Box
                  component="img"
                  src="/media/legend/prescription/Qualité_urbaine/LMIC1.png"
                  alt="LMIC1"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/Qualité_urbaine/LMIC2.png"
                  alt="LMIC2"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Limite maximale d'implantation des constructions</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
                <Box
                  component="img"
                  src="/media/legend/prescription/Qualité_urbaine/LIIC1.png"
                  alt="LIIC1"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/Qualité_urbaine/LIIC2.png"
                  alt="LIIC2"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Limite imposée d'implantation de construction</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
                <Box
                  component="img"
                  src="/media/legend/prescription/Qualité_urbaine/CIN1.png"
                  alt="CIN1"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/Qualité_urbaine/CIN2.png"
                  alt="CIN2"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Constructions et installations nécessaires à des équipements collectifs en zone A ou N</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/Qualité_urbaine/STCZ.png"
                alt="STCZ"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Secteur à transfert de constructibilité en zone N</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/Qualité_urbaine/SDMC.png"
                alt="SDMC"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Secteur avec densité minimale de construction</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/Qualité_urbaine/RDERDC.png"
                alt="RDERDC"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Règles différenciées entre le rez-de-chaussée et les étages supérieurs de constructions</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/Qualité_urbaine/EAS.png"
                alt="EAS"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Emprise au sol</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/Qualité_urbaine/LIIC1.png"
                alt="LIIC1"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Hauteur maximale de façade</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/Qualité_urbaine/LMIC1.png"
                alt="LMIC1"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Hauteur maximale de faîtage ou de construction/ Hauteur imposé de façade</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/Qualité_urbaine/PDVP.png"
                alt="PDVP"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Point de vue, prespective à préserver et à mettre en valeur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/Qualité_urbaine/AE.png"
                alt="AE"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Aspect extérieur</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/Qualité_urbaine/S.png"
                alt="S"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Stationnement</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/Qualité_urbaine/SZAC.png"
                alt="SZAC"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Secteur de ZAC avec surfaces de plancher déterminées</Typography>
            </Box>
          </Box>
        </Box>

        {/* Secteur de projet */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, color: '#059669', ml: 1 }}>
            Secteur de projet
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ml: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/Secteur_de_projet/SPM.png"
                alt="SPM"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Secteur de plan de masse</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
                <Box
                  component="img"
                  src="/media/legend/prescription/Secteur_de_projet/PC1.png"
                  alt="PC1"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/Secteur_de_projet/PC2.png"
                  alt="PC2"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/Secteur_de_projet/PC3.png"
                  alt="PC3"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Périmètre comportant des orientations d'aménagement et de programmation (OAP)</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/Secteur_de_projet/OEI.png"
                alt="OEI"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Opération d'ensemble imposée en zone AU</Typography>
            </Box>
          </Box>
        </Box>

        {/* Equipements, réseaux et emplacements réservées */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, color: '#059669', ml: 1 }}>
            Equipements, réseaux et emplacements réservées
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ml: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
                <Box
                  component="img"
                  src="/media/legend/prescription/ERER/ER1.png"
                  alt="ER1"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/ERER/ER2.png"
                  alt="ER2"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/ERER/ER3.png"
                  alt="ER3"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Emplacement réservé</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/ERER/VCTP.png"
                alt="VCTP"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Voies, chemins, transport public à conserver et à créer</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/ERER/PLP.png"
                alt="PLP"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Passage ou liaison piétonne à maintenir ou à créer</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/ERER/SPE.png"
                alt="SPE"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Secteur de perfomance énergétique</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/ERER/SAN.png"
                alt="SAN"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Secteur d'aménagement numérique</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
                <Box
                  component="img"
                  src="/media/legend/prescription/ERER/CD1.png"
                  alt="CD1"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/ERER/CD2.png"
                  alt="CD2"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/ERER/CD3.png"
                  alt="CD3"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Conditions de desserte</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/ERER/DPR.png"
                alt="DPR"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Desserte par les réseaux</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/ERER/MLI.png"
                alt="MLI"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Mesures pour limiter l'imperméabilisation des sols</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
                <Box
                  component="img"
                  src="/media/legend/prescription/ERER/IE1.png"
                  alt="IE1"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/ERER/IE2.png"
                  alt="IE2"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/ERER/IE3.png"
                  alt="IE3"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Infrastructures et équipements logistiques à préserver ou à développer en zone U et AU</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
                <Box
                  component="img"
                  src="/media/legend/prescription/ERER/DA1161.png"
                  alt="DA1161"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
                <Box
                  component="img"
                  src="/media/legend/prescription/ERER/DA1162.png"
                  alt="DA1162"
                  sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
                />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Dérogation à l'article L.111-6 pour l'implantation des constructions le long des grands axes routiers</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/ERER/SIIP.png"
                alt="SIIP"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Secteur d'implantation d'installations de production d'énergies renouvelables</Typography>
            </Box>
          </Box>
        </Box>

        {/* Secteurs soumis à d'autres dispositions particulières */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, color: '#059669', ml: 1 }}>
            Secteurs soumis à d'autres dispositions particulières
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, ml: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/SSADP/LCPR.png"
                alt="LCPR"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>limitation de la constructiblité pour des raisons environementales, de risques, d'intérêt général</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/SSADP/ZAP.png"
                alt="ZAP"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Zone à aménager en vue de la pratique du ski</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/SSADP/SPRR.png"
                alt="SPRR"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Secteur protégé en raison de la richesse du sol et du sous-sol</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/SSADP/ITAD.png"
                alt="ITAD"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Interdiction types d'activité, destinations, sous destinations.</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Box
                component="img"
                src="/media/legend/prescription/SSADP/ASC.png"
                alt="ASC"
                sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0 }}
              />
              <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Autorisations sous conditions types d'activités, destinations, sous destinations.</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const getPluInformationLegendContent = (showTitle = true) => {
  return (
    <Box>
      {showTitle && (
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          PLU Information
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Secteur sauvegardé */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
            <Box
              component="img"
              src="/media/legend/information/SS1.png"
              alt="Secteur sauvegardé 1"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
            <Box
              component="img"
              src="/media/legend/information/SS2.png"
              alt="Secteur sauvegardé 2"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1.3 }}>Secteur sauvegardé</Typography>
        </Box>

        {/* Zone d'aménagement concerté */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/ZAC.png"
            alt="Zone d'aménagement concerté"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Zone d'aménagement concerté</Typography>
        </Box>

        {/* Zone de préemption */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/ZPE.png"
            alt="Zone de préemption dans un espace naturel et sensible"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Zone de préemption dans un espace naturel et sensible</Typography>
        </Box>

        {/* Périmètre de droit de préemption urbain */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/PDP.png"
            alt="Périmètre de droit de préemption urbain"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Périmètre de droit de préemption urbain</Typography>
        </Box>

        {/* Zone d'aménagement différé */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/ZAD.png"
            alt="Zone d'aménagement différé"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Zone d'aménagement différé</Typography>
        </Box>

        {/* Zone d'obligation du permis de démolir */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/ZOPD.png"
            alt="Zone d'obligation du permis de démolir"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Zone d'obligation du permis de démolir</Typography>
        </Box>

        {/* Périmètre de développement prioritaire économie d'énergie */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/PDPE.png"
            alt="Périmètre de développement prioritaire économie d'énergie"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Périmètre de développement prioritaire économie d'énergie</Typography>
        </Box>

        {/* Périmètre forestier */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
            <Box
              component="img"
              src="/media/legend/information/PFIR1.png"
              alt="Périmètre forestier 1"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
            <Box
              component="img"
              src="/media/legend/information/PFIR2.png"
              alt="Périmètre forestier 2"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
          </Box>
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Périmètre forestier : interdiction ou réglementation des plantations, plantations à réaliser et semis d'essence forestière</Typography>
        </Box>

        {/* Périmètre minier de concession */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/PMCE.png"
            alt="Périmètre minier de concession pour l'exploitation ou le stockage"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Périmètre minier de concession pour l'exploitation ou le stockage</Typography>
        </Box>

        {/* Zone de recherche et d'exploitation de carrière */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/ZREC.png"
            alt="Zone de recherche et d'exploitation de carrière"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Zone de recherche et d'exploitation de carrière</Typography>
        </Box>

        {/* Périmètre des zones délimitées */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/PZDDF.png"
            alt="Périmètre des zones délimitées - divisions foncière soumises à déclaration préalable"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Périmètre des zones délimitées - divisions foncière soumises à déclaration préalable</Typography>
        </Box>

        {/* Périmètre de sursis à statuer */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/PSS.png"
            alt="Périmètre de sursis à statuer"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>pérmiètre de sursis à statuer</Typography>
        </Box>

        {/* Secteur de programme d'aménagement d'ensemble */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/SPAE.png"
            alt="Secteur de programme d'aménagement d'ensemble"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Secteur de programme d'aménagement d'ensemble</Typography>
        </Box>

        {/* Périmètre de voisinage d'infrastructure de transport terrestre */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
            <Box
              component="img"
              src="/media/legend/information/PVI1.png"
              alt="Périmètre de voisinage d'infrastructure de transport terrestre 1"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
            <Box
              component="img"
              src="/media/legend/information/PVI2.png"
              alt="Périmètre de voisinage d'infrastructure de transport terrestre 2"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
          </Box>
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>périmètre de voisinage d'infrastructure de transport terrestre (secteur affecté par le bruit)</Typography>
        </Box>

        {/* Zone agricole protégée */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/ZAP.png"
            alt="Zone agricole protégée"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>zone agricole protégée</Typography>
        </Box>

        {/* Site archéologique */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
            <Box
              component="img"
              src="/media/legend/information/SA1.png"
              alt="Site archéologique 1"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
            <Box
              component="img"
              src="/media/legend/information/SA2.png"
              alt="Site archéologique 2"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
          </Box>
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>site archéologique</Typography>
        </Box>

        {/* Zone à risque d'exposition au plomb */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/ZREP.png"
            alt="Zone à risque d'exposition au plomb"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>zone à risque d'exposition au plomb</Typography>
        </Box>

        {/* Espace et milieux à préserver */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/EMP.png"
            alt="Espace et milieux à préserver, en fonction de l'intérêt écologique"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>espace et milieux à préserver, en fonction de l'intérêt écologique</Typography>
        </Box>

        {/* Zones d'assainissement collectif / non collectif / eaux usées / eaux pluviales */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
            <Box
              component="img"
              src="/media/legend/information/ZAC1.png"
              alt="Zones d'assainissement 1"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
            <Box
              component="img"
              src="/media/legend/information/ZAC2.png"
              alt="Zones d'assainissement 2"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
            <Box
              component="img"
              src="/media/legend/information/ZAC3.png"
              alt="Zones d'assainissement 3"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
          </Box>
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Zones d'assainissement collectif / non collectif / eaux usées / eaux pluviales, schéma de réseaux eau et assainissement, systèmes d'élimination des déchets</Typography>
        </Box>

        {/* Règlement local de publicité */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/RLP.png"
            alt="Règlement local de publicité"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>règlement local de publicité</Typography>
        </Box>

        {/* Projet de plan de prévention des risques */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/PPPR.png"
            alt="Projet de plan de prévention des risques"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Projet de plan de prévention des risques</Typography>
        </Box>

        {/* Protection des rives des plan d'eau en zone de montagne */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/PRPEZ.png"
            alt="Protection des rives des plan d'eau en zone de montagne"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>protection des rives des plan d'eau en zone de montagne</Typography>
        </Box>

        {/* Arrêté du préfet coordonnateur de massif */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/APCM.png"
            alt="Arrêté du préfet coordonnateur de massif"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Arrêté du préfet coordonnateur de massif</Typography>
        </Box>

        {/* Document d'aménagement artisanal et Commercial */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/DAAC.png"
            alt="Document d'aménagement artisanal et Commercial"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Document d'aménagement artisanal et Commercial</Typography>
        </Box>

        {/* Périmètre de protection des espaces agricoles et naturels péri-urbains */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/PPEA.png"
            alt="Périmètre de protection des espaces agricoles et naturels péri-urbains"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Périmètre de protection des espaces agricoles et naturels péri-urbains</Typography>
        </Box>

        {/* Lotissment */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/L.png"
            alt="Lotissment"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Lotissment</Typography>
        </Box>

        {/* Plan d'exposition au bruit des aérodromes */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
            <Box
              component="img"
              src="/media/legend/information/PEBA1.png"
              alt="Plan d'exposition au bruit des aérodromes 1"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
            <Box
              component="img"
              src="/media/legend/information/PEBA2.png"
              alt="Plan d'exposition au bruit des aérodromes 2"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
            <Box
              component="img"
              src="/media/legend/information/PEBA3.png"
              alt="Plan d'exposition au bruit des aérodromes 3"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
          </Box>
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Plan d'exposition au bruit des aérodromes</Typography>
        </Box>

        {/* Dépassement des règles du Plan Local d'Urbanisme pour diversité de l'habitat */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/DRPLUPDH.png"
            alt="Dépassement des règles du Plan Local d'Urbanisme pour diversité de l'habitat"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Dépassement des règles du Plan Local d'Urbanisme pour diversité de l'habitat</Typography>
        </Box>

        {/* Dépassement des règles du Plan Local d'Urbanisme pour performance énergétique */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/DRPLUPPE.png"
            alt="Dépassement des règles du Plan Local d'Urbanisme pour performance énergétique"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Dépassement des règles du Plan Local d'Urbanisme pour performance énergétique</Typography>
        </Box>

        {/* Périmètre projet urbain partenarial */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/PPUP.png"
            alt="Périmètre projet urbain partenarial"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Périmètre projet urbain partenarial</Typography>
        </Box>

        {/* Périmètres patrimoniaux, d'exclusion des matériaux et énergies renouvelable pris par délibération */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/PPEMERPD.png"
            alt="Périmètres patrimoniaux, d'exclusion des matériaux et énergies renouvelable pris par délibération"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Périmètres patrimoniaux, d'exclusion des matériaux et énergies renouvelable pris par délibération</Typography>
        </Box>

        {/* Secteur de taxe d'aménagement */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/STA.png"
            alt="Secteur de taxe d'aménagement"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>secteur de taxe d'aménagement</Typography>
        </Box>

        {/* Droit de préemption commercial */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/DPC.png"
            alt="Droit de préemption commercial"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>droit de préemption commercial</Typography>
        </Box>

        {/* Périmètre d'opération d'intérêt national */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/POIN.png"
            alt="Périmètre d'opération d'intérêt national"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Périmètre d'opération d'intérêt national</Typography>
        </Box>

        {/* Périmètre de secteur affecté par un seuil minimal de densité */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/PSAPSM.png"
            alt="Périmètre de secteur affecté par un seuil minimal de densité"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Périmètre de secteur affecté par un seuil minimal de densité</Typography>
        </Box>

        {/* Schéma d'aménagement de plage */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/SAP.png"
            alt="Schéma d'aménagement de plage"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Schéma d'aménagement de plage</Typography>
        </Box>

        {/* Bois ou forêts relevant du régime forestier */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/BFRRF.png"
            alt="Bois ou forêts relevant du régime forestier"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Bois ou forêts relevant du régime forestier</Typography>
        </Box>

        {/* Secteur d'information sur les sols */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/SISS.png"
            alt="Secteur d'information sur les sols"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>secteur d'information sur les sols</Typography>
        </Box>

        {/* Périmètre de projet Association Foncière Urbain de projet */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/PPAFU.png"
            alt="Périmètre de projet Association Foncière Urbain de projet"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Périmètre de projet Association Foncière Urbain de projet</Typography>
        </Box>

        {/* Secteur délimité par délibération de l'autorité compétente en matière d'urbanisme, dans lesquels certaines opérations sont soumises à l'autorisation d'urbanisme */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/SDDA.png"
            alt="Secteur délimité par délibération de l'autorité compétente en matière d'urbanisme, dans lesquels certaines opérations sont soumises à l'autorisation d'urbanisme"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>secteur délimité par délibération de l'autorité compétente en matière d'urbanisme, dans lesquels certaines opérations sont soumises à l'autorisation d'urbanisme</Typography>
        </Box>

        {/* Emprise ou localisation des immeubles bâtis ou non bâtis classés ou inscrits au titre des monuments historiques */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/ELIB.png"
            alt="Emprise ou localisation des immeubles bâtis ou non bâtis classés ou inscrits au titre des monuments historiques"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Emprise ou localisation des immeubles bâtis ou non bâtis classés ou inscrits au titre des monuments historiques</Typography>
        </Box>

        {/* Périmètre d'annulation partielle du document d'urbanisme */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box
            component="img"
            src="/media/legend/information/PAPDU.png"
            alt="Périmètre d'annulation partielle du document d'urbanisme"
            sx={{ width: 20, height: 20, objectFit: 'contain', flexShrink: 0, mt: 0.5 }}
          />
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Périmètre d'annulation partielle du document d'urbanisme</Typography>
        </Box>

        {/* Autres Périmètres d'informations */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, mt: 0.5 }}>
            <Box
              component="img"
              src="/media/legend/information/API1.png"
              alt="Autres Périmètres d'informations 1"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
            <Box
              component="img"
              src="/media/legend/information/API2.png"
              alt="Autres Périmètres d'informations 2"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
            <Box
              component="img"
              src="/media/legend/information/API3.png"
              alt="Autres Périmètres d'informations 3"
              sx={{ width: 20, height: 20, objectFit: 'contain' }}
            />
          </Box>
          <Typography variant="caption" sx={{ lineHeight: 1.3 }}>Autres Périmètres d'informations</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const getPluZoningLegendContent = (showTitle = true) => {
  return (
    <Box>
      {showTitle && (
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          PLU Zoning
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#E60000', borderRadius: 1 }} />
          <Typography variant="caption">Zone urbaine</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#FF6565', borderRadius: 1 }} />
          <Typography variant="caption">Zone à urbaniser, ouverte</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#FECCBE', borderRadius: 1 }} />
          <Typography variant="caption">Zone à urbaniser, bloquée</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#FFFF00', borderRadius: 1 }} />
          <Typography variant="caption">Zone agricole</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#56AA02', borderRadius: 1 }} />
          <Typography variant="caption">Zone naturelle et forestière</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#B11C00', borderRadius: 1 }} />
          <Typography variant="caption">Secteur ouvert à la construction</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#AA00CC', borderRadius: 1 }} />
          <Typography variant="caption">Secteur réservé aux activités</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: '#AAFF00', borderRadius: 1 }} />
          <Typography variant="caption">Constructions non autorisées</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const PLULegend: React.FC<PLULegendProps> = ({
  showPluZoning = false,
  showPluInformation = false,
  showPluPrescriptions = false
}) => {

  if (!showPluZoning && !showPluInformation && !showPluPrescriptions) {
    return null;
  }

  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set());

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName);
      } else {
        newSet.add(sectionName);
      }
      return newSet;
    });
  };

  // Calculate legend items once
  const legendItems: LegendItem[] = React.useMemo(() => {
    const items: LegendItem[] = [];
    if (showPluZoning) {
      items.push({ content: getPluZoningLegendContent(), name: 'PluZoning', color: '#E60000' });
    }
    if (showPluInformation) {
      items.push({ content: getPluInformationLegendContent(), name: 'PluInformation', color: '#56AA02' });
    }
    if (showPluPrescriptions) {
      items.push({ content: getPluPrescriptionsLegendContent(), name: 'PluPrescriptions', color: '#059669' });
    }
    return items;
  }, [showPluZoning, showPluInformation, showPluPrescriptions]);

  // Auto-expand sections based on legend items count
  React.useEffect(() => {
    if (legendItems.length <= 3) {
      setExpandedSections(new Set(legendItems.map(item => item.name)));
    } else {
      setExpandedSections(new Set([legendItems[0]?.name || '']));
    }
  }, [legendItems.length, legendItems]);

  const getLegendContent = () => {
    if (legendItems.length === 0) return null;
    if (legendItems.length === 1) return legendItems[0].content;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {legendItems.map((item, index) => {
          const isExpanded = expandedSections.has(item.name);
          return (
            <Box key={item.name}>
              <Box
                onClick={() => toggleSection(item.name)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  },
                  transition: 'background-color 0.2s ease'
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: item.color,
                    borderRadius: '50%',
                    flexShrink: 0
                  }}
                />
                <Typography variant="subtitle2" sx={{
                  fontWeight: 600,
                  fontSize: '12px',
                  color: '#1e293b',
                  flex: 1
                }}>
                  {item.name === 'PluZoning' ? 'PLU Zoning' :
                    item.name === 'PluInformation' ? 'PLU Information' : item.name}
                </Typography>
                <Typography sx={{
                  fontSize: '10px',
                  color: '#64748b',
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}>
                  ▶
                </Typography>
              </Box>

              <Box sx={{
                overflow: 'hidden',
                maxHeight: isExpanded ? 'none' : '0px',
                opacity: isExpanded ? 1 : 0,
                transition: 'opacity 0.3s ease, max-height 0.3s ease'
              }}>
                <Box sx={{ px: 1, pb: 1 }}>
                  {item.content}
                </Box>
              </Box>

              {index < legendItems.length - 1 && (
                <Divider sx={{ mx: 1, borderColor: 'rgba(0, 0, 0, 0.08)' }} />
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  // If any PLU layers are active, show their legends
  if (showPluZoning || showPluInformation || showPluPrescriptions) {
    const legendItems = [];

    if (showPluZoning) legendItems.push({ name: 'PluZoning', color: '#E60000' });
    if (showPluInformation) legendItems.push({ name: 'PluInformation', color: '#56AA02' });
    if (showPluPrescriptions) legendItems.push({ name: 'PluPrescriptions', color: '#059669' });

    return (
      <Card sx={{
        minWidth: 300,
        maxWidth: 340,
        maxHeight: '70vh',
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        borderRadius: 2,
        border: "1px solid rgba(0, 0, 0, 0.08)"
      }}>
        <CardContent sx={{ p: 2, maxHeight: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, flexShrink: 0 }}>
            <LegendToggle sx={{ fontSize: 18, mr: 1, color: "#3b82f6" }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b", fontSize: '16px' }}>
              PLU Legend
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
              {legendItems.slice(0, 3).map((item) => (
                <Box
                  key={item.name}
                  sx={{
                    width: 8,
                    height: 8,
                    backgroundColor: item.color,
                    borderRadius: '50%',
                    opacity: 0.7
                  }}
                />
              ))}
              {legendItems.length > 3 && (
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '10px' }}>
                  +{legendItems.length - 3}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{
            flex: 1,
            overflow: 'auto',
            pr: 1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '3px',
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.3)',
              },
            },
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05)'
          }}>
            {getLegendContent()}
          </Box>

          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e2e8f0", flexShrink: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Info sx={{ fontSize: 14, color: "#64748b" }} />
              <Typography variant="caption" color="text.secondary">
                Plan Local d'Urbanisme
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default memo(PLULegend);
export { getPluInformationLegendContent, getPluPrescriptionsLegendContent, getPluZoningLegendContent };

