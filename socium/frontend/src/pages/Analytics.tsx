import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLeadAnalytics } from '../services/api';
import { AnalyticsData } from '../types';

const Analytics: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getAnalyticsData = async () => {
            try {
                const data = await fetchLeadAnalytics();
                setAnalyticsData(data);
            } catch (err) {
                setError('Failed to fetch analytics data');
            } finally {
                setLoading(false);
            }
        };

        getAnalyticsData();
    }, []);

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '400px',
                fontSize: '18px'
            }}>
                📊 Carregando analytics...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: '#e74c3c'
            }}>
                ❌ {error}
                <br />
                <Link to="/" style={{ color: '#3498db', marginTop: '20px', display: 'inline-block' }}>
                    Voltar ao início
                </Link>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>📈 Analytics & Insights</h1>
                <p style={{ color: '#7f8c8d', fontSize: '1.1rem' }}>
                    Métricas detalhadas e análise de performance dos leads
                </p>
                <Link 
                    to="/" 
                    style={{ 
                        color: '#3498db', 
                        textDecoration: 'none',
                        display: 'inline-block',
                        marginTop: '10px'
                    }}
                >
                    ← Voltar ao Dashboard
                </Link>
            </div>

            {analyticsData && (
                <div>
                    {/* Métricas Principais */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                        gap: '20px',
                        marginBottom: '40px'
                    }}>
                        <div style={{ 
                            backgroundColor: '#3498db', 
                            color: 'white', 
                            padding: '25px', 
                            borderRadius: '10px',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{ margin: '0 0 10px 0', fontSize: '2.5em' }}>{analyticsData.totalLeads}</h2>
                            <p style={{ margin: 0, fontSize: '1.1em' }}>Total de Leads</p>
                            <small style={{ opacity: 0.8 }}>Processados pelo sistema</small>
                        </div>

                        <div style={{ 
                            backgroundColor: '#27ae60', 
                            color: 'white', 
                            padding: '25px', 
                            borderRadius: '10px',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{ margin: '0 0 10px 0', fontSize: '2.5em' }}>{analyticsData.qualifiedLeads}</h2>
                            <p style={{ margin: 0, fontSize: '1.1em' }}>Leads Qualificados</p>
                            <small style={{ opacity: 0.8 }}>Aprovados pela IA</small>
                        </div>

                        <div style={{ 
                            backgroundColor: '#e74c3c', 
                            color: 'white', 
                            padding: '25px', 
                            borderRadius: '10px',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{ margin: '0 0 10px 0', fontSize: '2.5em' }}>{analyticsData.conversionRate.toFixed(1)}%</h2>
                            <p style={{ margin: 0, fontSize: '1.1em' }}>Taxa de Conversão</p>
                            <small style={{ opacity: 0.8 }}>Qualificados/Total</small>
                        </div>

                        <div style={{ 
                            backgroundColor: '#f39c12', 
                            color: 'white', 
                            padding: '25px', 
                            borderRadius: '10px',
                            textAlign: 'center',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <h2 style={{ margin: '0 0 10px 0', fontSize: '2.5em' }}>{analyticsData.averageScore.toFixed(1)}</h2>
                            <p style={{ margin: 0, fontSize: '1.1em' }}>Score Médio de IA</p>
                            <small style={{ opacity: 0.8 }}>Pontuação geral</small>
                        </div>
                    </div>

                    {/* Distribuição de Oportunidades */}
                    <div style={{ 
                        backgroundColor: '#fff', 
                        padding: '30px', 
                        borderRadius: '10px',
                        marginBottom: '30px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>🎯 Distribuição de Oportunidades</h3>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: '20px'
                        }}>
                            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                <div style={{ 
                                    fontSize: '2.5em', 
                                    fontWeight: 'bold', 
                                    color: '#3498db',
                                    marginBottom: '10px'
                                }}>
                                    {analyticsData.opportunityDistribution.vendas}
                                </div>
                                <div style={{ color: '#2c3e50', fontWeight: 'bold' }}>💰 Vendas</div>
                                <div style={{ color: '#7f8c8d', fontSize: '0.9em' }}>
                                    {((analyticsData.opportunityDistribution.vendas / analyticsData.totalLeads) * 100).toFixed(1)}%
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                <div style={{ 
                                    fontSize: '2.5em', 
                                    fontWeight: 'bold', 
                                    color: '#27ae60',
                                    marginBottom: '10px'
                                }}>
                                    {analyticsData.opportunityDistribution.emprego}
                                </div>
                                <div style={{ color: '#2c3e50', fontWeight: 'bold' }}>💼 Emprego</div>
                                <div style={{ color: '#7f8c8d', fontSize: '0.9em' }}>
                                    {((analyticsData.opportunityDistribution.emprego / analyticsData.totalLeads) * 100).toFixed(1)}%
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                <div style={{ 
                                    fontSize: '2.5em', 
                                    fontWeight: 'bold', 
                                    color: '#e74c3c',
                                    marginBottom: '10px'
                                }}>
                                    {analyticsData.opportunityDistribution.pesquisa}
                                </div>
                                <div style={{ color: '#2c3e50', fontWeight: 'bold' }}>🔬 Pesquisa</div>
                                <div style={{ color: '#7f8c8d', fontSize: '0.9em' }}>
                                    {((analyticsData.opportunityDistribution.pesquisa / analyticsData.totalLeads) * 100).toFixed(1)}%
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                                <div style={{ 
                                    fontSize: '2.5em', 
                                    fontWeight: 'bold', 
                                    color: '#f39c12',
                                    marginBottom: '10px'
                                }}>
                                    {analyticsData.opportunityDistribution.networking}
                                </div>
                                <div style={{ color: '#2c3e50', fontWeight: 'bold' }}>🤝 Networking</div>
                                <div style={{ color: '#7f8c8d', fontSize: '0.9em' }}>
                                    {((analyticsData.opportunityDistribution.networking / analyticsData.totalLeads) * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Análise de Sentimento */}
                    <div style={{ 
                        backgroundColor: '#fff', 
                        padding: '30px', 
                        borderRadius: '10px',
                        marginBottom: '30px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>😊 Análise de Sentimento</h3>
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                            gap: '20px'
                        }}>
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '20px', 
                                backgroundColor: '#d5f4e6', 
                                borderRadius: '8px',
                                border: '2px solid #27ae60'
                            }}>
                                <div style={{ fontSize: '3em', marginBottom: '10px' }}>😊</div>
                                <div style={{ 
                                    fontSize: '2em', 
                                    fontWeight: 'bold', 
                                    color: '#27ae60',
                                    marginBottom: '5px'
                                }}>
                                    {analyticsData.sentimentDistribution.positivo}
                                </div>
                                <div style={{ color: '#2c3e50', fontWeight: 'bold' }}>Positivo</div>
                            </div>

                            <div style={{ 
                                textAlign: 'center', 
                                padding: '20px', 
                                backgroundColor: '#fff3cd', 
                                borderRadius: '8px',
                                border: '2px solid #f39c12'
                            }}>
                                <div style={{ fontSize: '3em', marginBottom: '10px' }}>😐</div>
                                <div style={{ 
                                    fontSize: '2em', 
                                    fontWeight: 'bold', 
                                    color: '#f39c12',
                                    marginBottom: '5px'
                                }}>
                                    {analyticsData.sentimentDistribution.neutro}
                                </div>
                                <div style={{ color: '#2c3e50', fontWeight: 'bold' }}>Neutro</div>
                            </div>

                            <div style={{ 
                                textAlign: 'center', 
                                padding: '20px', 
                                backgroundColor: '#f8d7da', 
                                borderRadius: '8px',
                                border: '2px solid #e74c3c'
                            }}>
                                <div style={{ fontSize: '3em', marginBottom: '10px' }}>😞</div>
                                <div style={{ 
                                    fontSize: '2em', 
                                    fontWeight: 'bold', 
                                    color: '#e74c3c',
                                    marginBottom: '5px'
                                }}>
                                    {analyticsData.sentimentDistribution.negativo}
                                </div>
                                <div style={{ color: '#2c3e50', fontWeight: 'bold' }}>Negativo</div>
                            </div>
                        </div>
                    </div>

                    {/* Tendências Mensais */}
                    <div style={{ 
                        backgroundColor: '#fff', 
                        padding: '30px', 
                        borderRadius: '10px',
                        marginBottom: '30px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>📊 Tendências Mensais</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Mês</th>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Total Leads</th>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Qualificados</th>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Convertidos</th>
                                        <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Taxa Conversão</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analyticsData.monthlyTrends.map((month, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{month.month}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{month.leads}</td>
                                            <td style={{ padding: '12px', textAlign: 'center', color: '#27ae60' }}>{month.qualified}</td>
                                            <td style={{ padding: '12px', textAlign: 'center', color: '#3498db' }}>{month.converted}</td>
                                            <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                                                {month.leads > 0 ? ((month.converted / month.leads) * 100).toFixed(1) : '0.0'}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Insights e Recomendações */}
                    <div style={{ 
                        backgroundColor: '#e8f5e8', 
                        padding: '30px', 
                        borderRadius: '10px',
                        border: '2px solid #27ae60'
                    }}>
                        <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>💡 Insights e Recomendações</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <h4 style={{ color: '#27ae60' }}>✅ Pontos Fortes</h4>
                                <ul style={{ color: '#2c3e50' }}>
                                    <li>Taxa de conversão {analyticsData.conversionRate > 20 ? 'excelente' : 'boa'}</li>
                                    <li>Score médio de IA elevado ({analyticsData.averageScore.toFixed(1)})</li>
                                    <li>{analyticsData.qualifiedLeads} leads qualificados disponíveis</li>
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ color: '#e67e22' }}>🎯 Oportunidades</h4>
                                <ul style={{ color: '#2c3e50' }}>
                                    <li>Focar em leads de vendas (maior conversão)</li>
                                    <li>Melhorar engagement com sentimento neutro</li>
                                    <li>Automatizar follow-up dos leads qualificados</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;