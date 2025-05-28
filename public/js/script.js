// Elementos DOM
const formAvaliacao = document.getElementById('form-avaliacao');
const successMessage = document.getElementById('success-message');
const btnNewEvaluation = document.getElementById('btn-new-evaluation');
const dataExperienciaInput = document.getElementById('data_experiencia');
const telefoneInput = document.getElementById('telefone_avaliador');
const nomeClienteInput = document.getElementById('nome_cliente');
const ratingContainer = document.getElementById('rating-container');

// Elementos de navegação
const btnNovaAvaliacao = document.getElementById('btn-nova-avaliacao');
const btnListarAvaliacoes = document.getElementById('btn-listar-avaliacoes');
const btnVerAvaliacoesAposEnvio = document.getElementById('btn-ver-avaliacoes-apos-envio');
const btnVoltarForm = document.getElementById('btn-voltar-form');
const btnAdmin = document.getElementById('btn-admin');
const btnSairAdmin = document.getElementById('btn-sair-admin');

// Seções
const novaAvaliacaoSection = document.getElementById('nova-avaliacao-section');
const listarAvaliacoesSection = document.getElementById('listar-avaliacoes-section');

// Lista de avaliações
const avaliacoesLista = document.getElementById('avaliacoes-lista');
const filtroPontuacao = document.getElementById('filtro-pontuacao');
const adminStatus = document.getElementById('admin-status');

// Modal Admin
const modalAdmin = document.getElementById('modal-admin');
const formAdminLogin = document.getElementById('form-admin-login');
const adminSenhaInput = document.getElementById('admin-senha');
const loginError = document.getElementById('login-error');
const closeModalButtons = document.querySelectorAll('.close-modal');

// Modal Confirmação de Exclusão
const modalConfirmarExclusao = document.getElementById('modal-confirmar-exclusao');
const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
const btnCancelarExclusao = document.getElementById('btn-cancelar-exclusao');

// Variáveis globais
let isAdminMode = false;
let avaliacaoParaExcluir = null;
// Mapa para armazenar IDs de avaliações
let mapaAvaliacoes = {};

// Função para mostrar mensagem de erro
function mostrarErro(elemento, mensagem) {
    // Remover mensagem de erro anterior, se existir
    const erroAnterior = elemento.parentElement.querySelector('.erro-campo');
    if (erroAnterior) {
        erroAnterior.remove();
    }
    
    // Criar elemento para mostrar erro
    const erroElemento = document.createElement('p');
    erroElemento.className = 'erro-campo';
    erroElemento.textContent = mensagem;
    
    // Inserir após o elemento
    elemento.parentElement.appendChild(erroElemento);
    
    // Destacar o campo com erro
    elemento.classList.add('campo-com-erro');
    
    // Focar no elemento
    elemento.focus();
}

// Função para mostrar mensagem de erro para as estrelas
function mostrarErroPontuacao(mensagem) {
    // Remover mensagem de erro anterior, se existir
    const erroAnterior = ratingContainer.querySelector('.erro-campo');
    if (erroAnterior) {
        erroAnterior.remove();
    }
    
    // Criar elemento para mostrar erro
    const erroElemento = document.createElement('p');
    erroElemento.className = 'erro-campo';
    erroElemento.textContent = mensagem;
    
    // Inserir após o elemento de rating
    ratingContainer.appendChild(erroElemento);
    
    // Destacar o container de rating
    ratingContainer.classList.add('container-com-erro');
    
    // Rolar até o elemento de rating, se necessário
    ratingContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Função para limpar mensagens de erro
function limparErros() {
    // Remover todas as mensagens de erro
    document.querySelectorAll('.erro-campo').forEach(el => el.remove());
    
    // Remover destaque de campos com erro
    document.querySelectorAll('.campo-com-erro').forEach(el => {
        el.classList.remove('campo-com-erro');
    });
    
    // Remover destaque do container de rating
    document.querySelectorAll('.container-com-erro').forEach(el => {
        el.classList.remove('container-com-erro');
    });
}

// Função para validar o formato da data (DD/MM/AAAA)
function validarFormatoData(dataStr) {
    // Regex para o formato DD/MM/AAAA
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    
    if (!regex.test(dataStr)) {
        return { valido: false, mensagem: 'Formato de data inválido. Exemplo 01/12/2025.' };
    }
    
    // Extrair dia, mês e ano
    const partes = regex.exec(dataStr);
    const dia = parseInt(partes[1], 10);
    const mes = parseInt(partes[2], 10) - 1; // Mês em JavaScript é 0-11
    const ano = parseInt(partes[3], 10);
    
    // Criar objeto Date e verificar se é uma data válida
    const data = new Date(ano, mes, dia);
    if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes ||
        data.getDate() !== dia
    ) {
        return { valido: false, mensagem: 'Data inválida.' };
    }
    
    // Verificar se a data não é futura
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (data > hoje) {
        return { valido: false, mensagem: 'A data não pode ser no futuro.' };
    }
    
    // Verificar se a data não é mais de 30 dias atrás
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    trintaDiasAtras.setHours(0, 0, 0, 0);
    
    if (data < trintaDiasAtras) {
        return { valido: false, mensagem: 'A data não pode ser mais de 30 dias atrás.' };
    }
    
    return { 
        valido: true, 
        data: data,
        dataFormatada: `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}` // Formato YYYY-MM-DD para o backend
    };
}

// Função para validar telefone
function validarTelefone(telefone) {
    // Remover todos os caracteres não numéricos
    const apenasNumeros = telefone.replace(/\D/g, '');
    
    // Verificar se tem entre 10 e 11 dígitos (com ou sem DDD)
    if (apenasNumeros.length < 10 || apenasNumeros.length > 11) {
        return { 
            valido: false, 
            mensagem: 'Telefone inválido. Digite um número com DDD (10 ou 11 dígitos).' 
        };
    }
    
    return { 
        valido: true, 
        telefoneFormatado: apenasNumeros 
    };
}

// Função para validar pontuação (estrelas)
function validarPontuacao() {
    const pontuacaoRadios = document.getElementsByName('pontuacao');
    let selecionado = false;
    
    for (const radio of pontuacaoRadios) {
        if (radio.checked) {
            selecionado = true;
            break;
        }
    }
    
    return selecionado;
}

// Função para formatar data YYYY-MM-DD para DD/MM/YYYY
function formatarData(dataStr) {
    if (!dataStr) return '';
    
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Função para gerar estrelas HTML
function gerarEstrelas(quantidade) {
    return '★'.repeat(quantidade);
}

// Função para censurar telefone
function censurarTelefone(telefone) {
    if (!telefone) return '';
    
    // Formato: (XX) XXXXX-XXXX -> (XX) *****-XXXX
    if (telefone.length === 11) {
        const ddd = telefone.substring(0, 2);
        const final = telefone.substring(7);
        return `(${ddd}) *****-${final}`;
    } 
    // Formato: (XX) XXXX-XXXX -> (XX) ****-XXXX
    else {
        const ddd = telefone.substring(0, 2);
        const final = telefone.substring(6);
        return `(${ddd}) ****-${final}`;
    }
}

// Função para formatar telefone para exibição
function formatarTelefoneExibicao(telefone) {
    if (!telefone) return '';
    
    if (telefone.length === 11) {
        // Celular: (00) 00000-0000
        return `(${telefone.substring(0, 2)}) ${telefone.substring(2, 7)}-${telefone.substring(7)}`;
    } else {
        // Fixo: (00) 0000-0000
        return `(${telefone.substring(0, 2)}) ${telefone.substring(2, 6)}-${telefone.substring(6)}`;
    }
}

// Função para alternar entre as seções
function mostrarSecao(secao) {
    // Esconder todas as seções
    novaAvaliacaoSection.classList.remove('active');
    listarAvaliacoesSection.classList.remove('active');
    
    // Remover classe active de todos os botões de navegação
    btnNovaAvaliacao.classList.remove('active');
    btnListarAvaliacoes.classList.remove('active');
    
    // Mostrar a seção selecionada
    if (secao === 'nova-avaliacao') {
        novaAvaliacaoSection.classList.add('active');
        btnNovaAvaliacao.classList.add('active');
    } else if (secao === 'listar-avaliacoes') {
        listarAvaliacoesSection.classList.add('active');
        btnListarAvaliacoes.classList.add('active');
        carregarAvaliacoes();
    }
}

// Função para ativar o modo admin
function ativarModoAdmin() {
    isAdminMode = true;
    adminStatus.classList.remove('hidden');
    btnAdmin.classList.add('active');
    carregarAvaliacoes(); // Recarregar avaliações para mostrar telefones e botões de excluir
}

// Função para desativar o modo admin
function desativarModoAdmin() {
    isAdminMode = false;
    adminStatus.classList.add('hidden');
    btnAdmin.classList.remove('active');
    carregarAvaliacoes(); // Recarregar avaliações para esconder telefones e botões de excluir
}

// Função para mostrar o modal de login admin
function mostrarModalAdmin() {
    modalAdmin.classList.remove('hidden');
    adminSenhaInput.value = '';
    loginError.classList.add('hidden');
    adminSenhaInput.focus();
}

// Função para fechar modais
function fecharModais() {
    modalAdmin.classList.add('hidden');
    modalConfirmarExclusao.classList.add('hidden');
    loginError.classList.add('hidden');
}

// Função para mostrar o modal de confirmação de exclusão
function mostrarModalConfirmacao(avaliacaoId, indice) {
    console.log('ID recebido em mostrarModalConfirmacao:', avaliacaoId);
    console.log('Índice recebido em mostrarModalConfirmacao:', indice);
    
    // Verificar se o ID é válido
    if (!avaliacaoId || avaliacaoId === 'undefined') {
        console.error('ID inválido recebido em mostrarModalConfirmacao');
        alert('Erro: ID da avaliação inválido');
        return;
    }
    
    // Armazenar o ID e o índice para uso posterior
    avaliacaoParaExcluir = {
        id: avaliacaoId,
        indice: indice
    };
    
    modalConfirmarExclusao.classList.remove('hidden');
}

// Função para excluir avaliação
async function excluirAvaliacao(id) {
    try {
        // Verificar se o ID é válido
        if (!id || id === 'undefined') {
            console.error('ID inválido para exclusão:', id);
            alert('Erro: ID da avaliação inválido');
            return;
        }
        
        console.log('Enviando requisição de exclusão para o ID:', id);
        
        // Adicionar um ID de requisição único para depuração
        const requestId = Date.now().toString();
        
        const response = await fetch(`/api/avaliacoes/${id}?requestId=${requestId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
            throw new Error(errorData.error || 'Erro ao excluir avaliação');
        }
        
        // Recarregar avaliações após excluir
        carregarAvaliacoes();
        
    } catch (error) {
        console.error('Erro ao excluir avaliação:', error);
        alert('Erro ao excluir avaliação: ' + error.message);
    }
}

// Função para carregar avaliações do servidor
async function carregarAvaliacoes() {
    try {
        avaliacoesLista.innerHTML = '<p class="empty-message">Carregando avaliações...</p>';
        
        const response = await fetch('/api/avaliacoes');
        if (!response.ok) {
            throw new Error('Erro ao carregar avaliações');
        }
        
        const avaliacoes = await response.json();
        
        console.log('Dados recebidos do servidor:', avaliacoes);
        if (avaliacoes.length > 0) {
            console.log('Exemplo de avaliação:', avaliacoes[0], 'ID:', avaliacoes[0]._id);
        }
        
        if (avaliacoes.length === 0) {
            avaliacoesLista.innerHTML = '<p class="empty-message">Nenhuma avaliação encontrada.</p>';
            return;
        }
        
        // Filtrar por pontuação, se necessário
        const filtro = parseInt(filtroPontuacao.value);
        const avaliacoesFiltradas = filtro > 0 
            ? avaliacoes.filter(a => parseInt(a.pontuacao) === filtro)
            : avaliacoes;
        
        if (avaliacoesFiltradas.length === 0) {
            avaliacoesLista.innerHTML = '<p class="empty-message">Nenhuma avaliação encontrada com este filtro.</p>';
            return;
        }
        
        // Limpar o mapa de avaliações
        mapaAvaliacoes = {};
        
        // Renderizar avaliações
        avaliacoesLista.innerHTML = '';
        avaliacoesFiltradas.forEach((avaliacao, index) => {
            // Armazenar o ID da avaliação no mapa
            const avaliacaoId = avaliacao.id || (avaliacao._id ? avaliacao._id.toString() : null);
            if (avaliacaoId) {
                mapaAvaliacoes[index] = avaliacaoId;
            }
            
            const card = document.createElement('div');
            card.className = 'avaliacao-card';
            card.dataset.index = index; // Usar índice como identificador
            
            // Verificar se está em modo admin para mostrar o telefone completo e botão de excluir
            const telefoneExibicao = isAdminMode 
                ? formatarTelefoneExibicao(avaliacao.telefone_avaliador)
                : censurarTelefone(avaliacao.telefone_avaliador);
            
            const classeTelefone = isAdminMode ? '' : 'telefone-censurado';
            
            // Verificar dados da avaliação para depuração
            if (isAdminMode) {
                console.log(`Avaliação ${index}:`, avaliacao);
                console.log(`ID mapeado para índice ${index}:`, mapaAvaliacoes[index]);
            }
            
            // Botão de excluir (apenas em modo admin)
            const botaoExcluir = isAdminMode 
                ? `<button class="btn-excluir" data-index="${index}" type="button">Excluir</button>` 
                : '';
            
            card.innerHTML = `
                <div class="avaliacao-header">
                    <div class="avaliacao-info">
                        <div class="avaliacao-cliente">Cliente: ${avaliacao.nome_cliente}</div>
                        <div class="avaliacao-nome">Funcionário: ${avaliacao.nome_funcionario}</div>
                    </div>
                    <div class="avaliacao-data">${formatarData(avaliacao.data_experiencia)}</div>
                </div>
                <div class="avaliacao-estrelas">
                    <span class="estrela">${gerarEstrelas(avaliacao.pontuacao)}</span>
                </div>
                ${avaliacao.comentario ? `<div class="avaliacao-comentario">${avaliacao.comentario}</div>` : ''}
                <div class="avaliacao-contato">
                    <div class="avaliacao-contato-admin">
                        <div class="${classeTelefone}">Tel: ${telefoneExibicao}</div>
                        ${botaoExcluir}
                    </div>
                    ${avaliacao.email_avaliador ? `<div>Email: ${avaliacao.email_avaliador}</div>` : ''}
                </div>
            `;
            
            avaliacoesLista.appendChild(card);
            
            // Adicionar evento de clique ao botão de excluir, se estiver em modo admin
            if (isAdminMode) {
                const btnExcluir = card.querySelector('.btn-excluir');
                btnExcluir.addEventListener('click', (e) => {
                    e.preventDefault();
                    const index = parseInt(e.target.dataset.index);
                    console.log('Índice para exclusão:', index);
                    console.log('ID mapeado:', mapaAvaliacoes[index]);
                    
                    if (index !== undefined && mapaAvaliacoes[index]) {
                        mostrarModalConfirmacao(mapaAvaliacoes[index], index);
                    } else {
                        console.error('Índice inválido ou ID não mapeado');
                        alert('Erro ao identificar a avaliação para exclusão');
                    }
                });
            }
        });
        
    } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
        avaliacoesLista.innerHTML = '<p class="empty-message">Erro ao carregar avaliações. Tente novamente mais tarde.</p>';
    }
}

// Adicionar máscara de data ao campo
dataExperienciaInput.addEventListener('input', function(e) {
    let valor = e.target.value;
    
    // Remover caracteres não numéricos
    valor = valor.replace(/\D/g, '');
    
    // Adicionar barras
    if (valor.length > 2) {
        valor = valor.substring(0, 2) + '/' + valor.substring(2);
    }
    if (valor.length > 5) {
        valor = valor.substring(0, 5) + '/' + valor.substring(5, 9);
    }
    
    // Limitar a 10 caracteres (DD/MM/AAAA)
    if (valor.length > 10) {
        valor = valor.substring(0, 10);
    }
    
    e.target.value = valor;
});

// Adicionar máscara de telefone
telefoneInput.addEventListener('input', function(e) {
    let valor = e.target.value;
    
    // Remover caracteres não numéricos
    valor = valor.replace(/\D/g, '');
    
    // Aplicar máscara conforme o tamanho
    if (valor.length <= 2) {
        // Apenas DDD
        valor = `(${valor}`;
    } else if (valor.length <= 6) {
        // DDD e início do número
        valor = `(${valor.substring(0, 2)}) ${valor.substring(2)}`;
    } else if (valor.length <= 10) {
        // Formato para telefone fixo: (00) 0000-0000
        valor = `(${valor.substring(0, 2)}) ${valor.substring(2, 6)}-${valor.substring(6)}`;
    } else {
        // Formato para celular: (00) 00000-0000
        valor = `(${valor.substring(0, 2)}) ${valor.substring(2, 7)}-${valor.substring(7, 11)}`;
    }
    
    e.target.value = valor;
});

// Eventos de navegação
btnNovaAvaliacao.addEventListener('click', () => mostrarSecao('nova-avaliacao'));
btnListarAvaliacoes.addEventListener('click', () => mostrarSecao('listar-avaliacoes'));
btnVoltarForm.addEventListener('click', () => mostrarSecao('nova-avaliacao'));
btnVerAvaliacoesAposEnvio.addEventListener('click', () => mostrarSecao('listar-avaliacoes'));

// Evento de filtro
filtroPontuacao.addEventListener('change', carregarAvaliacoes);

// Evento do botão Admin
btnAdmin.addEventListener('click', () => {
    if (isAdminMode) {
        desativarModoAdmin();
    } else {
        mostrarModalAdmin();
    }
});

// Evento do botão Sair Admin
btnSairAdmin.addEventListener('click', desativarModoAdmin);

// Função para verificar login do administrador
async function verificarLoginAdmin() {
    const senha = adminSenhaInput.value.trim();
    
    if (!senha) {
        loginError.textContent = 'Digite a senha';
        loginError.classList.remove('hidden');
        return;
    }
    
    try {
        // Enviar senha para verificação no servidor
        const response = await fetch('/api/admin/verificar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ senha })
        });
        
        const resultado = await response.json();
        
        if (resultado.autenticado) {
            // Autenticação bem-sucedida
            ativarModoAdmin();
            fecharModais();
        } else {
            // Autenticação falhou
            loginError.textContent = 'Senha incorreta!';
            loginError.classList.remove('hidden');
            adminSenhaInput.value = '';
            adminSenhaInput.focus();
        }
    } catch (error) {
        console.error('Erro ao verificar senha:', error);
        loginError.textContent = 'Erro ao verificar senha. Tente novamente.';
        loginError.classList.remove('hidden');
    }
}

// Evento de confirmação de exclusão
btnConfirmarExclusao.addEventListener('click', () => {
    console.log('Objeto para exclusão (confirmação):', avaliacaoParaExcluir);
    
    // Verificar se o objeto de exclusão é válido
    if (!avaliacaoParaExcluir || !avaliacaoParaExcluir.id || avaliacaoParaExcluir.id === 'undefined') {
        console.error('ID inválido na confirmação de exclusão');
        alert('Erro: ID da avaliação inválido');
        fecharModais();
        return;
    }
    
    // Verificar se o ID ainda existe no mapa
    if (avaliacaoParaExcluir.indice !== undefined && 
        mapaAvaliacoes[avaliacaoParaExcluir.indice] !== avaliacaoParaExcluir.id) {
        console.error('ID não corresponde mais ao índice no mapa');
        alert('Erro: Os dados foram alterados. Atualize a página e tente novamente.');
        fecharModais();
        return;
    }
    
    excluirAvaliacao(avaliacaoParaExcluir.id);
    avaliacaoParaExcluir = null;
    fecharModais();
});

// Evento de cancelamento de exclusão
btnCancelarExclusao.addEventListener('click', () => {
    avaliacaoParaExcluir = null;
    fecharModais();
});

// Eventos para fechar modais
closeModalButtons.forEach(button => {
    button.addEventListener('click', fecharModais);
});

// Fechar modais ao clicar fora do conteúdo
window.addEventListener('click', (e) => {
    if (e.target === modalAdmin) {
        fecharModais();
    }
    if (e.target === modalConfirmarExclusao) {
        fecharModais();
    }
});

// Enviar avaliação
formAvaliacao.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Limpar mensagens de erro anteriores
    limparErros();
    
    let temErro = false;
    let primeiroElementoComErro = null;
    
    // Validar nome do cliente
    const nomeCliente = document.getElementById('nome_cliente').value.trim();
    if (!nomeCliente) {
        mostrarErro(document.getElementById('nome_cliente'), 'Por favor, informe seu nome.');
        temErro = true;
        if (!primeiroElementoComErro) primeiroElementoComErro = document.getElementById('nome_cliente');
    }
    
    // Validar nome do funcionário
    const nomeFuncionario = document.getElementById('nome_funcionario').value.trim();
    if (!nomeFuncionario) {
        mostrarErro(document.getElementById('nome_funcionario'), 'Por favor, informe o nome do funcionário.');
        temErro = true;
        if (!primeiroElementoComErro) primeiroElementoComErro = document.getElementById('nome_funcionario');
    }
    
    // Validar a data
    const dataExperiencia = dataExperienciaInput.value;
    let resultadoValidacaoData = { valido: false };
    if (!dataExperiencia) {
        mostrarErro(dataExperienciaInput, 'Por favor, informe a data da experiência.');
        temErro = true;
        if (!primeiroElementoComErro) primeiroElementoComErro = dataExperienciaInput;
    } else {
        resultadoValidacaoData = validarFormatoData(dataExperiencia);
        if (!resultadoValidacaoData.valido) {
            mostrarErro(dataExperienciaInput, resultadoValidacaoData.mensagem);
            temErro = true;
            if (!primeiroElementoComErro) primeiroElementoComErro = dataExperienciaInput;
        }
    }
    
    // Validar pontuação (estrelas)
    if (!validarPontuacao()) {
        mostrarErroPontuacao('Por favor, selecione uma pontuação.');
        temErro = true;
        if (!primeiroElementoComErro) primeiroElementoComErro = ratingContainer;
    }
    
    // Validar o telefone
    const telefone = telefoneInput.value;
    let resultadoValidacaoTelefone = { valido: false };
    if (!telefone) {
        mostrarErro(telefoneInput, 'Por favor, informe seu telefone.');
        temErro = true;
        if (!primeiroElementoComErro) primeiroElementoComErro = telefoneInput;
    } else {
        resultadoValidacaoTelefone = validarTelefone(telefone);
        if (!resultadoValidacaoTelefone.valido) {
            mostrarErro(telefoneInput, resultadoValidacaoTelefone.mensagem);
            temErro = true;
            if (!primeiroElementoComErro) primeiroElementoComErro = telefoneInput;
        }
    }
    
    if (temErro) {
        // Rolar até o primeiro elemento com erro
        if (primeiroElementoComErro) {
            primeiroElementoComErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    // Obter valor do radio button selecionado
    const pontuacaoRadios = document.getElementsByName('pontuacao');
    let pontuacao;
    for (const radio of pontuacaoRadios) {
        if (radio.checked) {
            pontuacao = radio.value;
            break;
        }
    }
    
    const avaliacaoData = {
        nome_cliente: nomeCliente,
        nome_funcionario: nomeFuncionario,
        pontuacao: pontuacao,
        comentario: document.getElementById('comentario').value,
        telefone_avaliador: resultadoValidacaoTelefone.telefoneFormatado,
        email_avaliador: document.getElementById('email_avaliador').value || null,
        data_experiencia: resultadoValidacaoData.dataFormatada
    };
    
    try {
        const response = await fetch('/api/avaliacoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(avaliacaoData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao enviar avaliação');
        }
        
        // Mostrar mensagem de sucesso
        formAvaliacao.classList.add('hidden');
        successMessage.classList.remove('hidden');
        
    } catch (error) {
        console.error('Erro ao enviar avaliação:', error);
        alert(`Erro ao enviar avaliação: ${error.message}`);
    }
});

// Nova avaliação
btnNewEvaluation.addEventListener('click', () => {
    // Limpar formulário
    formAvaliacao.reset();
    
    // Limpar mensagens de erro
    limparErros();
    
    // Esconder mensagem de sucesso e mostrar formulário
    successMessage.classList.add('hidden');
    formAvaliacao.classList.remove('hidden');
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Iniciar na seção de nova avaliação
    mostrarSecao('nova-avaliacao');
});

// Evento de login admin
formAdminLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    verificarLoginAdmin();
});

 