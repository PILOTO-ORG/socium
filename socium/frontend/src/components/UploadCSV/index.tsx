import React, { useState, useRef } from 'react';
import { uploadCSV } from '../../services/api';

interface UploadCSVProps {
    onUploadSuccess: () => void;
}

interface UploadStatus {
    isUploading: boolean;
    progress: number;
    error: string | null;
    success: string | null;
}

const UploadCSV: React.FC<UploadCSVProps> = ({ onUploadSuccess }) => {
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
        isUploading: false,
        progress: 0,
        error: null,
        success: null
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileSelect = async (file: File) => {
        if (!file) return;

        // Validar tipo de arquivo
        if (!file.name.endsWith('.csv')) {
            setUploadStatus({
                ...uploadStatus,
                error: 'Por favor, selecione um arquivo CSV válido'
            });
            return;
        }

        // Validar tamanho (10MB máximo)
        if (file.size > 10 * 1024 * 1024) {
            setUploadStatus({
                ...uploadStatus,
                error: 'Arquivo muito grande. Máximo permitido: 10MB'
            });
            return;
        }

        setUploadStatus({
            isUploading: true,
            progress: 0,
            error: null,
            success: null
        });

        try {
            const formData = new FormData();
            formData.append('csvFile', file);

            // Simular progresso (seria real em uma implementação com XMLHttpRequest)
            const progressInterval = setInterval(() => {
                setUploadStatus(prev => ({
                    ...prev,
                    progress: Math.min(prev.progress + 10, 90)
                }));
            }, 200);

            const response = await uploadCSV(formData);

            clearInterval(progressInterval);

            if (response.success) {
                setUploadStatus({
                    isUploading: false,
                    progress: 100,
                    error: null,
                    success: `CSV processado com sucesso! ${response.data.messagesProcessed} mensagens processadas, ${response.data.leadsGenerated} leads gerados.`
                });
                
                onUploadSuccess();
                
                // Limpar status após 5 segundos
                setTimeout(() => {
                    setUploadStatus({
                        isUploading: false,
                        progress: 0,
                        error: null,
                        success: null
                    });
                }, 5000);
            } else {
                throw new Error(response.message || 'Erro no upload');
            }

        } catch (error) {
            setUploadStatus({
                isUploading: false,
                progress: 0,
                error: error instanceof Error ? error.message : 'Erro no upload do arquivo',
                success: null
            });
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                Upload de CSV
            </h3>
            
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                        ? 'border-blue-400 bg-blue-50'
                        : uploadStatus.error
                        ? 'border-red-300 bg-red-50'
                        : uploadStatus.success
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                />

                {uploadStatus.isUploading ? (
                    <div className="space-y-4">
                        <div className="text-blue-600">
                            <svg className="mx-auto h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth={4}
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Processando arquivo...</p>
                            <div className="mt-2 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadStatus.progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{uploadStatus.progress}%</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-8 w-8" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                        
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                <button
                                    onClick={openFileDialog}
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Clique para selecionar
                                </button>
                                {' '}ou arraste seu arquivo CSV aqui
                            </p>
                            <p className="text-xs text-gray-500">
                                Máximo 10MB • Apenas arquivos .csv
                            </p>
                        </div>
                    </>
                )}
            </div>

            {uploadStatus.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{uploadStatus.error}</p>
                        </div>
                    </div>
                </div>
            )}

            {uploadStatus.success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-800">{uploadStatus.success}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
                <p className="font-medium mb-1">Formato esperado do CSV:</p>
                <p>O arquivo deve conter colunas como: CONVERSATION ID, FROM, TO, CONTENT, DATE, etc.</p>
                <p>Compatível com exports do LinkedIn Messages.</p>
            </div>
        </div>
    );
};

export default UploadCSV;
