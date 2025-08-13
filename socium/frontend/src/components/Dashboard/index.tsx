import React, { useState, useEffect } from 'react';
import { fetchLeads, fetchDashboardMetrics, updateLeadStatus } from '../../services/api';
import { Lead, AnalyticsData, DashboardFilters } from '../../types';
import UploadCSV from '../UploadCSV';

const Dashboard: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [metrics, setMetrics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [filters, setFilters] = useState<DashboardFilters>({});
    const [sortBy, setSortBy] = useState<keyof Lead>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);

    useEffect(() => {
        loadData();
    }, [filters, sortBy, sortOrder]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [leadsData, metricsData] = await Promise.all([
                fetchLeads({ ...filters, sortBy, sortOrder }),
                fetchDashboardMetrics()
            ]);
            setLeads(leadsData);
            setMetrics(metricsData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (leadId: number, newStatus: Lead['status']) => {
        try {
            await updateLeadStatus(leadId, newStatus);
            setLeads(leads.map(lead => 
                lead.id === leadId ? { ...lead, status: newStatus } : lead
            ));
        } catch (error) {
            console.error('Error updating lead status:', error);
        }
    };

    const handleSort = (column: keyof Lead) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const filteredLeads = leads.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const totalPages = Math.ceil(leads.length / pageSize);

    const getScoreColor = (score?: number) => {
        if (!score) return '#gray';
        if (score >= 80) return '#27ae60';
        if (score >= 60) return '#f39c12';
        if (score >= 40) return '#e67e22';
        return '#e74c3c';
    };

    const getStatusColor = (status: Lead['status']) => {
        const colors = {
            new: '#3498db',
            contacted: '#f39c12',
            qualified: '#27ae60',
            converted: '#2ecc71',
            lost: '#e74c3c'
        };
        return colors[status];
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '400px',
                fontSize: '18px'
            }}>
                🔄 Carregando dashboard...
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>📊 Dashboard Interativo</h1>
                <p style={{ color: '#7f8c8d' }}>Gestão completa de leads com análise de IA</p>
            </div>

            {/* Métricas em Tempo Real */}
            {metrics && (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '15px',
                    marginBottom: '30px'
                }}>
                    <div style={{ 
                        backgroundColor: '#3498db', 
                        color: 'white', 
                        padding: '20px', 
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '2em' }}>{metrics.totalLeads}</h3>
                        <p style={{ margin: 0 }}>Total de Leads</p>
                    </div>
                    <div style={{ 
                        backgroundColor: '#27ae60', 
                        color: 'white', 
                        padding: '20px', 
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '2em' }}>{metrics.qualifiedLeads}</h3>
                        <p style={{ margin: 0 }}>Qualificados</p>
                    </div>
                    <div style={{ 
                        backgroundColor: '#e74c3c', 
                        color: 'white', 
                        padding: '20px', 
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '2em' }}>{metrics.conversionRate.toFixed(1)}%</h3>
                        <p style={{ margin: 0 }}>Taxa de Conversão</p>
                    </div>
                    <div style={{ 
                        backgroundColor: '#f39c12', 
                        color: 'white', 
                        padding: '20px', 
                        borderRadius: '8px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '2em' }}>{metrics.averageScore.toFixed(1)}</h3>
                        <p style={{ margin: 0 }}>Score Médio</p>
                    </div>
                </div>
            )}

            {/* Upload de CSV */}
                        {/* Upload de CSV */}
            <UploadCSV onUploadSuccess={loadData} />

            {/* Filtros */}
            <div style={{ 
                backgroundColor: '#fff', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #dee2e6'
            }}>
                <h3 style={{ marginTop: 0, color: '#2c3e50' }}>🔍 Filtros</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <select
                        value={filters.status || ''}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value as Lead['status'] || undefined })}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="">Todos os Status</option>
                        <option value="new">Novo</option>
                        <option value="contacted">Contatado</option>
                        <option value="qualified">Qualificado</option>
                        <option value="converted">Convertido</option>
                        <option value="lost">Perdido</option>
                    </select>
                    
                    <select
                        value={filters.opportunityType || ''}
                        onChange={(e) => setFilters({ ...filters, opportunityType: e.target.value as any || undefined })}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                    >
                        <option value="">Todas as Oportunidades</option>
                        <option value="vendas">Vendas</option>
                        <option value="emprego">Emprego</option>
                        <option value="pesquisa">Pesquisa</option>
                        <option value="networking">Networking</option>
                    </select>
                </div>
            </div>

            {/* Grid Interativo de Leads */}
            <div style={{ 
                backgroundColor: '#fff', 
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #dee2e6'
            }}>
                <div style={{ 
                    overflow: 'auto',
                    maxHeight: '600px'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f8f9fa', position: 'sticky', top: 0 }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left', cursor: 'pointer', borderBottom: '2px solid #dee2e6' }}
                                    onClick={() => handleSort('name')}>
                                    Nome {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Empresa</th>
                                <th style={{ padding: '12px', textAlign: 'center', cursor: 'pointer', borderBottom: '2px solid #dee2e6' }}
                                    onClick={() => handleSort('status')}>
                                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Score IA</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Oportunidade</th>
                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>
                                        <div>
                                            <strong>{lead.name}</strong>
                                            <br />
                                            <small style={{ color: '#666' }}>{lead.email}</small>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <div>
                                            {lead.company}
                                            <br />
                                            <small style={{ color: '#666' }}>{lead.position}</small>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <select
                                            value={lead.status}
                                            onChange={(e) => handleStatusUpdate(lead.id, e.target.value as Lead['status'])}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                border: '1px solid #ddd',
                                                backgroundColor: getStatusColor(lead.status),
                                                color: 'white'
                                            }}
                                        >
                                            <option value="new">Novo</option>
                                            <option value="contacted">Contatado</option>
                                            <option value="qualified">Qualificado</option>
                                            <option value="converted">Convertido</option>
                                            <option value="lost">Perdido</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <div style={{
                                            backgroundColor: getScoreColor(lead.aiAnalysis?.score),
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            display: 'inline-block',
                                            fontWeight: 'bold'
                                        }}>
                                            {lead.aiAnalysis?.score || 'N/A'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {lead.aiAnalysis?.opportunityType || 'Analisando...'}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => setSelectedLead(lead)}
                                            style={{
                                                backgroundColor: '#3498db',
                                                color: 'white',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            📋 Detalhes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Paginação */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderTop: '1px solid #dee2e6'
                }}>
                    <div>
                        Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, leads.length)} de {leads.length} leads
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #ddd',
                                backgroundColor: currentPage === 1 ? '#f8f9fa' : '#fff',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                            }}
                        >
                            ← Anterior
                        </button>
                        <span style={{ padding: '8px 12px', border: '1px solid #ddd', backgroundColor: '#3498db', color: 'white' }}>
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '8px 12px',
                                border: '1px solid #ddd',
                                backgroundColor: currentPage === totalPages ? '#f8f9fa' : '#fff',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Próximo →
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Detalhes */}
            {selectedLead && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '30px',
                        borderRadius: '10px',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setSelectedLead(null)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '15px',
                                background: 'none',
                                border: 'none',
                                fontSize: '24px',
                                cursor: 'pointer'
                            }}
                        >
                            ×
                        </button>

                        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🔍 Análise Completa</h2>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <h3>{selectedLead.name}</h3>
                            <p><strong>Email:</strong> {selectedLead.email}</p>
                            <p><strong>Empresa:</strong> {selectedLead.company}</p>
                            <p><strong>Posição:</strong> {selectedLead.position}</p>
                        </div>

                        {selectedLead.aiAnalysis && (
                            <div>
                                <h3>🤖 Análise de IA</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                    <div>
                                        <strong>Score Geral:</strong>
                                        <div style={{ 
                                            backgroundColor: getScoreColor(selectedLead.aiAnalysis.score),
                                            color: 'white',
                                            padding: '5px 10px',
                                            borderRadius: '5px',
                                            display: 'inline-block',
                                            marginLeft: '10px'
                                        }}>
                                            {selectedLead.aiAnalysis.score}/100
                                        </div>
                                    </div>
                                    <div>
                                        <strong>Tipo:</strong> {selectedLead.aiAnalysis.opportunityType}
                                    </div>
                                    <div>
                                        <strong>Perfil:</strong> {selectedLead.aiAnalysis.profileScore}/100
                                    </div>
                                    <div>
                                        <strong>Engajamento:</strong> {selectedLead.aiAnalysis.engagementScore}/100
                                    </div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <strong>💡 Insights:</strong>
                                    <ul>
                                        {selectedLead.aiAnalysis.insights.map((insight, index) => (
                                            <li key={index}>{insight}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <strong>🎯 Próximas Ações:</strong>
                                    <ul>
                                        {selectedLead.aiAnalysis.nextActions.map((action, index) => (
                                            <li key={index}>{action}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;