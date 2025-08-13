import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchLeadAnalysis, analyzeAllLeads } from '../../services/api';
import { LeadAnalysisResult } from '../../types';

const LeadAnalysis: React.FC = () => {
    const [analysisResults, setAnalysisResults] = useState<LeadAnalysisResult[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [analyzing, setAnalyzing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        loadAnalysisResults();
    }, []);

    const loadAnalysisResults = async () => {
        try {
            setLoading(true);
            const results = await fetchLeadAnalysis();
            setAnalysisResults(results);
        } catch (err) {
            setError('Failed to fetch analysis results');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeAll = async () => {
        try {
            setAnalyzing(true);
            await analyzeAllLeads();
            await loadAnalysisResults();
            alert('Análise de todos os leads concluída com sucesso!');
        } catch (err) {
            alert('Erro ao executar análise');
        } finally {
            setAnalyzing(false);
        }
    };

    const getScoreColor = (score?: number) => {
        if (!score) return '#gray';
        if (score >= 80) return '#27ae60';
        if (score >= 60) return '#f39c12';
        if (score >= 40) return '#e67e22';
        return '#e74c3c';
    };

    const getCategoryIcon = (category?: string) => {
        const icons: { [key: string]: string } = {
            vendas: '💰',
            emprego: '💼',
            pesquisa: '🔬',
            networking: '🤝'
        };
        return icons[category || ''] || '📊';
    };

    const filteredResults = selectedCategory === 'all' 
        ? analysisResults 
        : analysisResults.filter(result => result.analysis?.opportunityType === selectedCategory);

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '400px',
                fontSize: '18px'
            }}>
                🤖 Carregando análises de IA...
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
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>🤖 Análise de IA dos Leads</h1>
                <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
                    Classificação inteligente e insights acionáveis
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Link 
                        to="/" 
                        style={{ 
                            color: '#3498db', 
                            textDecoration: 'none',
                            padding: '8px 16px',
                            border: '1px solid #3498db',
                            borderRadius: '5px'
                        }}
                    >
                        ← Voltar ao Dashboard
                    </Link>
                    <button
                        onClick={handleAnalyzeAll}
                        disabled={analyzing}
                        style={{
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '5px',
                            cursor: analyzing ? 'not-allowed' : 'pointer',
                            opacity: analyzing ? 0.6 : 1
                        }}
                    >
                        {analyzing ? '🔄 Processando...' : '🚀 Analisar Todos'}
                    </button>
                </div>
            </div>

            {/* Filtros por Categoria */}
            <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid #dee2e6'
            }}>
                <h3 style={{ marginTop: 0, color: '#2c3e50' }}>🔍 Filtrar por Tipo de Oportunidade</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {[
                        { value: 'all', label: 'Todas', icon: '📊' },
                        { value: 'vendas', label: 'Vendas', icon: '💰' },
                        { value: 'emprego', label: 'Emprego', icon: '💼' },
                        { value: 'pesquisa', label: 'Pesquisa', icon: '🔬' },
                        { value: 'networking', label: 'Networking', icon: '🤝' }
                    ].map(filter => (
                        <button
                            key={filter.value}
                            onClick={() => setSelectedCategory(filter.value)}
                            style={{
                                backgroundColor: selectedCategory === filter.value ? '#3498db' : '#fff',
                                color: selectedCategory === filter.value ? 'white' : '#2c3e50',
                                border: '1px solid #3498db',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            {filter.icon} {filter.label}
                        </button>
                    ))}
                </div>
                <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '0.9em' }}>
                    Mostrando {filteredResults.length} de {analysisResults.length} análises
                </p>
            </div>

            {/* Grid de Resultados */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                gap: '20px'
            }}>
                {filteredResults.map((result) => (
                    <div 
                        key={result.id}
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: '10px',
                            padding: '20px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            border: '1px solid #dee2e6',
                            transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                        }}
                    >
                        {/* Header do Card */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            marginBottom: '15px'
                        }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ 
                                    margin: '0 0 5px 0', 
                                    color: '#2c3e50',
                                    fontSize: '1.1em'
                                }}>
                                    {result.lead?.name || result.title}
                                </h3>
                                <p style={{ 
                                    margin: 0, 
                                    color: '#7f8c8d', 
                                    fontSize: '0.9em'
                                }}>
                                    {result.lead?.company} • {result.lead?.position}
                                </p>
                            </div>
                            
                            {result.analysis?.score && (
                                <div style={{
                                    backgroundColor: getScoreColor(result.analysis.score),
                                    color: 'white',
                                    padding: '8px 12px',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    fontSize: '0.9em'
                                }}>
                                    {result.analysis.score}/100
                                </div>
                            )}
                        </div>

                        {/* Tipo de Oportunidade */}
                        {result.analysis?.opportunityType && (
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                marginBottom: '15px',
                                padding: '8px 12px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px'
                            }}>
                                <span style={{ fontSize: '1.2em' }}>
                                    {getCategoryIcon(result.analysis.opportunityType)}
                                </span>
                                <span style={{ 
                                    fontWeight: 'bold', 
                                    textTransform: 'capitalize',
                                    color: '#2c3e50'
                                }}>
                                    {result.analysis.opportunityType}
                                </span>
                            </div>
                        )}

                        {/* Scores Detalhados */}
                        {result.analysis && (
                            <div style={{ marginBottom: '15px' }}>
                                <h4 style={{ 
                                    margin: '0 0 10px 0', 
                                    color: '#2c3e50',
                                    fontSize: '0.9em'
                                }}>
                                    📊 Pontuações Detalhadas
                                </h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                    <div style={{ textAlign: 'center', fontSize: '0.8em' }}>
                                        <div style={{ fontWeight: 'bold', color: '#3498db' }}>
                                            {result.analysis.profileScore}/100
                                        </div>
                                        <div style={{ color: '#666' }}>Perfil</div>
                                    </div>
                                    <div style={{ textAlign: 'center', fontSize: '0.8em' }}>
                                        <div style={{ fontWeight: 'bold', color: '#27ae60' }}>
                                            {result.analysis.engagementScore}/100
                                        </div>
                                        <div style={{ color: '#666' }}>Engagement</div>
                                    </div>
                                    <div style={{ textAlign: 'center', fontSize: '0.8em' }}>
                                        <div style={{ fontWeight: 'bold', color: '#e74c3c' }}>
                                            {result.analysis.intentionScore}/100
                                        </div>
                                        <div style={{ color: '#666' }}>Intenção</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Insights */}
                        {result.analysis?.insights && result.analysis.insights.length > 0 && (
                            <div style={{ marginBottom: '15px' }}>
                                <h4 style={{ 
                                    margin: '0 0 8px 0', 
                                    color: '#2c3e50',
                                    fontSize: '0.9em'
                                }}>
                                    💡 Principais Insights
                                </h4>
                                <ul style={{ 
                                    margin: 0, 
                                    paddingLeft: '15px',
                                    fontSize: '0.85em',
                                    color: '#555'
                                }}>
                                    {result.analysis.insights.slice(0, 2).map((insight, index) => (
                                        <li key={index} style={{ marginBottom: '3px' }}>
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Próximas Ações */}
                        {result.analysis?.nextActions && result.analysis.nextActions.length > 0 && (
                            <div style={{ marginBottom: '15px' }}>
                                <h4 style={{ 
                                    margin: '0 0 8px 0', 
                                    color: '#2c3e50',
                                    fontSize: '0.9em'
                                }}>
                                    🎯 Próximas Ações
                                </h4>
                                <ul style={{ 
                                    margin: 0, 
                                    paddingLeft: '15px',
                                    fontSize: '0.85em',
                                    color: '#555'
                                }}>
                                    {result.analysis.nextActions.slice(0, 2).map((action, index) => (
                                        <li key={index} style={{ marginBottom: '3px' }}>
                                            {action}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Sentimento */}
                        {result.analysis?.sentiment && (
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                padding: '8px 12px',
                                backgroundColor: result.analysis.sentiment === 'positivo' ? '#d5f4e6' : 
                                                result.analysis.sentiment === 'neutro' ? '#fff3cd' : '#f8d7da',
                                borderRadius: '6px',
                                marginTop: '10px'
                            }}>
                                <span style={{ fontSize: '0.85em', fontWeight: 'bold' }}>
                                    Sentimento: {result.analysis.sentiment}
                                </span>
                                <span>
                                    {result.analysis.sentiment === 'positivo' ? '😊' : 
                                     result.analysis.sentiment === 'neutro' ? '😐' : '😞'}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Mensagem quando não há resultados */}
            {filteredResults.length === 0 && (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '60px 20px',
                    color: '#7f8c8d'
                }}>
                    <div style={{ fontSize: '4em', marginBottom: '20px' }}>🤖</div>
                    <h3 style={{ marginBottom: '10px' }}>Nenhuma análise encontrada</h3>
                    <p>
                        {selectedCategory === 'all' 
                            ? 'Execute uma análise de IA para ver os resultados aqui.'
                            : `Nenhuma análise encontrada para a categoria "${selectedCategory}".`
                        }
                    </p>
                    <button
                        onClick={handleAnalyzeAll}
                        disabled={analyzing}
                        style={{
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '6px',
                            cursor: analyzing ? 'not-allowed' : 'pointer',
                            opacity: analyzing ? 0.6 : 1,
                            marginTop: '20px'
                        }}
                    >
                        {analyzing ? '🔄 Processando...' : '🚀 Iniciar Análise'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default LeadAnalysis;