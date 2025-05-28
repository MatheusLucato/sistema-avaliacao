const formAvaliacao = document.getElementById('form-avaliacao');
const successMessage = document.getElementById('success-message');
const btnNewEvaluation = document.getElementById('btn-new-evaluation');
const dataExperienciaInput = document.getElementById('data_experiencia');
const telefoneInput = document.getElementById('telefone_avaliador');
const nomeClienteInput = document.getElementById('nome_cliente');
const ratingContainer = document.getElementById('rating-container');

const btnNovaAvaliacao = document.getElementById('btn-nova-avaliacao');
const btnListarAvaliacoes = document.getElementById('btn-listar-avaliacoes');
const btnVerAvaliacoesAposEnvio = document.getElementById('btn-ver-avaliacoes-apos-envio');
const btnVoltarForm = document.getElementById('btn-voltar-form');
const btnAdmin = document.getElementById('btn-admin');
const btnSairAdmin = document.getElementById('btn-sair-admin');

const novaAvaliacaoSection = document.getElementById('nova-avaliacao-section');
const listarAvaliacoesSection = document.getElementById('listar-avaliacoes-section');

const avaliacoesLista = document.getElementById('avaliacoes-lista');
const filtroPontuacao = document.getElementById('filtro-pontuacao');
const adminStatus = document.getElementById('admin-status');

const modalAdmin = document.getElementById('modal-admin');
const formAdminLogin = document.getElementById('form-admin-login');
const adminSenhaInput = document.getElementById('admin-senha');
const loginError = document.getElementById('login-error');
const closeModalButtons = document.querySelectorAll('.close-modal');

const modalConfirmarExclusao = document.getElementById('modal-confirmar-exclusao');
const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
const btnCancelarExclusao = document.getElementById('btn-cancelar-exclusao');

let isAdminMode = false;
let avaliacaoParaExcluir = null;
let mapaAvaliacoes = {};

function mostrarErro(elemento, mensagem) {
    const erroAnterior = elemento.parentElement.querySelector('.erro-campo');
    if (erroAnterior) {
        erroAnterior.remove();
    }
    
    const erroElemento = document.createElement('p');
    erroElemento.className = 'erro-campo';
    erroElemento.textContent = mensagem;
    
    elemento.parentElement.appendChild(erroElemento);
    
    elemento.classList.add('campo-com-erro');
    
    elemento.focus();
}

function mostrarErroPontuacao(mensagem) {
    const erroAnterior = ratingContainer.querySelector('.erro-campo');
    if (erroAnterior) {
        erroAnterior.remove();
    }
    
    const erroElemento = document.createElement('p');
    erroElemento.className = 'erro-campo';
    erroElemento.textContent = mensagem;
    
    ratingContainer.appendChild(erroElemento);
    
    ratingContainer.classList.add('container-com-erro');
    
    ratingContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function limparErros() {
    document.querySelectorAll('.erro-campo').forEach(el => el.remove());
    
    document.querySelectorAll('.campo-com-erro').forEach(el => {
        el.classList.remove('campo-com-erro');
    });
    
    document.querySelectorAll('.container-com-erro').forEach(el => {
        el.classList.remove('container-com-erro');
    });
}

function validarFormatoData(dataStr) {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    
    if (!regex.test(dataStr)) {
        return { valido: false, mensagem: 'Formato de data inválido. Exemplo 01/12/2025.' };
    }
    
    const partes = regex.exec(dataStr);
    const dia = parseInt(partes[1], 10);
    const mes = parseInt(partes[2], 10) - 1;
    const ano = parseInt(partes[3], 10);
    
    const data = new Date(ano, mes, dia);
    if (
        data.getFullYear() !== ano ||
        data.getMonth() !== mes ||
        data.getDate() !== dia
    ) {
        return { valido: false, mensagem: 'Data inválida.' };
    }
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (data > hoje) {
        return { valido: false, mensagem: 'A data não pode ser no futuro.' };
    }
    
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    trintaDiasAtras.setHours(0, 0, 0, 0);
    
    if (data < trintaDiasAtras) {
        return { valido: false, mensagem: 'A data não pode ser mais de 30 dias atrás.' };
    }
    
    return { 
        valido: true, 
        data: data,
        dataFormatada: `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    };
}

function validarTelefone(telefone) {
    const apenasNumeros = telefone.replace(/\D/g, '');
    
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

function formatarData(dataStr) {
    if (!dataStr) return '';
    
    try {
        const data = new Date(dataStr);
        
        if (isNaN(data.getTime())) {
            console.error('Data inválida:', dataStr);
            return 'Data inválida';
        }
        
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
        const ano = data.getFullYear();
        
        return `${dia}/${mes}/${ano}`;
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Data inválida';
    }
}

function gerarEstrelas(quantidade) {
    return '★'.repeat(quantidade);
}

function censurarTelefone(telefone) {
    if (!telefone) return '';
    
    if (telefone.length === 11) {
        const ddd = telefone.substring(0, 2);
        const final = telefone.substring(7);
        return `(${ddd}) *****-${final}`;
    } 
    else {
        const ddd = telefone.substring(0, 2);
        const final = telefone.substring(6);
        return `(${ddd}) ****-${final}`;
    }
}

function censurarEmail(email) {
    if (!email) return '';
    
    const partes = email.split('@');
    if (partes.length !== 2) return '****@****.***';
    
    const usuario = partes[0];
    const dominio = partes[1];
    
    let usuarioCensurado = '';
    if (usuario.length <= 2) {
        usuarioCensurado = '*'.repeat(usuario.length);
    } else {
        usuarioCensurado = usuario.substring(0, 1) + '*'.repeat(usuario.length - 2) + usuario.substring(usuario.length - 1);
    }
    
    const dominioPartes = dominio.split('.');
    if (dominioPartes.length < 2) return `${usuarioCensurado}@****.***`;
    
    const dominioNome = dominioPartes[0];
    const extensao = dominioPartes.slice(1).join('.');
    
    let dominioCensurado = '';
    if (dominioNome.length <= 2) {
        dominioCensurado = '*'.repeat(dominioNome.length);
    } else {
        dominioCensurado = dominioNome.substring(0, 1) + '*'.repeat(dominioNome.length - 2) + dominioNome.substring(dominioNome.length - 1);
    }
    
    return `${usuarioCensurado}@${dominioCensurado}.${extensao}`;
}

function formatarTelefoneExibicao(telefone) {
    if (!telefone) return '';
    
    if (telefone.length === 11) {
        return `(${telefone.substring(0, 2)}) ${telefone.substring(2, 7)}-${telefone.substring(7)}`;
    } else {
        return `(${telefone.substring(0, 2)}) ${telefone.substring(2, 6)}-${telefone.substring(6)}`;
    }
}

function mostrarSecao(secao) {
    novaAvaliacaoSection.classList.remove('active');
    listarAvaliacoesSection.classList.remove('active');
    
    btnNovaAvaliacao.classList.remove('active');
    btnListarAvaliacoes.classList.remove('active');
    
    if (secao === 'nova-avaliacao') {
        novaAvaliacaoSection.classList.add('active');
        btnNovaAvaliacao.classList.add('active');
    } else if (secao === 'listar-avaliacoes') {
        listarAvaliacoesSection.classList.add('active');
        btnListarAvaliacoes.classList.add('active');
        carregarAvaliacoes();
    }
}

function ativarModoAdmin() {
    isAdminMode = true;
    adminStatus.classList.remove('hidden');
    btnAdmin.classList.add('active');
    avaliacoesLista.classList.add('modo-admin');
    carregarAvaliacoes();
}

function desativarModoAdmin() {
    isAdminMode = false;
    adminStatus.classList.add('hidden');
    btnAdmin.classList.remove('active');
    avaliacoesLista.classList.remove('modo-admin');
    carregarAvaliacoes();
}

function mostrarModalAdmin() {
    modalAdmin.classList.remove('hidden');
    adminSenhaInput.value = '';
    loginError.classList.add('hidden');
    adminSenhaInput.focus();
}

function fecharModais() {
    modalAdmin.classList.add('hidden');
    modalConfirmarExclusao.classList.add('hidden');
    loginError.classList.add('hidden');
}

function mostrarModalConfirmacao(avaliacaoId, indice) {
    console.log('ID recebido em mostrarModalConfirmacao:', avaliacaoId);
    console.log('Índice recebido em mostrarModalConfirmacao:', indice);
    
    if (!avaliacaoId || avaliacaoId === 'undefined') {
        console.error('ID inválido recebido em mostrarModalConfirmacao');
        alert('Erro: ID da avaliação inválido');
        return;
    }
    
    avaliacaoParaExcluir = {
        id: avaliacaoId,
        indice: indice
    };
    
    modalConfirmarExclusao.classList.remove('hidden');
}

async function excluirAvaliacao(id) {
    try {
        if (!id || id === 'undefined') {
            console.error('ID inválido para exclusão:', id);
            alert('Erro: ID da avaliação inválido');
            return;
        }
        
        console.log('Enviando requisição de exclusão para o ID:', id);
        
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
        
        carregarAvaliacoes();
        
    } catch (error) {
        console.error('Erro ao excluir avaliação:', error);
        alert('Erro ao excluir avaliação: ' + error.message);
    }
}

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
            console.log('Exemplo de avaliação:', avaliacoes[0]);
            console.log('Formato da data_experiencia:', avaliacoes[0].data_experiencia);
            // Testar a formatação da data
            console.log('Data formatada:', formatarData(avaliacoes[0].data_experiencia));
        }
        
        if (avaliacoes.length === 0) {
            avaliacoesLista.innerHTML = '<p class="empty-message">Nenhuma avaliação encontrada.</p>';
            return;
        }
        
        const filtro = parseInt(filtroPontuacao.value);
        const avaliacoesFiltradas = filtro > 0 
            ? avaliacoes.filter(a => parseInt(a.pontuacao) === filtro)
            : avaliacoes;
        
        if (avaliacoesFiltradas.length === 0) {
            avaliacoesLista.innerHTML = '<p class="empty-message">Nenhuma avaliação encontrada com este filtro.</p>';
            return;
        }
        
        mapaAvaliacoes = {};
        
        avaliacoesLista.innerHTML = '';
        avaliacoesFiltradas.forEach((avaliacao, index) => {
            const avaliacaoId = avaliacao.id || (avaliacao._id ? avaliacao._id.toString() : null);
            if (avaliacaoId) {
                mapaAvaliacoes[index] = avaliacaoId;
            }
            
            const card = document.createElement('div');
            card.className = 'avaliacao-card';
            card.dataset.index = index;
            
            const telefoneExibicao = isAdminMode 
                ? formatarTelefoneExibicao(avaliacao.telefone_avaliador)
                : censurarTelefone(avaliacao.telefone_avaliador);
            
            const classeTelefone = isAdminMode ? 'telefone-completo' : 'telefone-censurado';
            
            // Tratar o email
            let emailHtml = '';
            if (avaliacao.email_avaliador) {
                const emailExibicao = isAdminMode 
                    ? avaliacao.email_avaliador
                    : censurarEmail(avaliacao.email_avaliador);
                
                const classeEmail = isAdminMode ? 'email-completo' : 'email-censurado';
                emailHtml = `<div class="${classeEmail}">Email: ${emailExibicao}</div>`;
            }
            
            if (isAdminMode) {
                console.log(`Avaliação ${index}:`, avaliacao);
                console.log(`ID mapeado para índice ${index}:`, mapaAvaliacoes[index]);
            }
            
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
                    ${emailHtml}
                </div>
            `;
            
            avaliacoesLista.appendChild(card);
            
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

dataExperienciaInput.addEventListener('input', function(e) {
    let valor = e.target.value;
    
    valor = valor.replace(/\D/g, '');
    
    if (valor.length > 2) {
        valor = valor.substring(0, 2) + '/' + valor.substring(2);
    }
    if (valor.length > 5) {
        valor = valor.substring(0, 5) + '/' + valor.substring(5, 9);
    }
    
    if (valor.length > 10) {
        valor = valor.substring(0, 10);
    }
    
    e.target.value = valor;
});

telefoneInput.addEventListener('input', function(e) {
    let valor = e.target.value;
    
    valor = valor.replace(/\D/g, '');
    
    if (valor.length <= 2) {
        valor = `(${valor}`;
    } else if (valor.length <= 6) {
        valor = `(${valor.substring(0, 2)}) ${valor.substring(2)}`;
    } else if (valor.length <= 10) {
        valor = `(${valor.substring(0, 2)}) ${valor.substring(2, 6)}-${valor.substring(6)}`;
    } else {
        valor = `(${valor.substring(0, 2)}) ${valor.substring(2, 7)}-${valor.substring(7, 11)}`;
    }
    
    e.target.value = valor;
});

btnNovaAvaliacao.addEventListener('click', () => mostrarSecao('nova-avaliacao'));
btnListarAvaliacoes.addEventListener('click', () => mostrarSecao('listar-avaliacoes'));
btnVoltarForm.addEventListener('click', () => mostrarSecao('nova-avaliacao'));
btnVerAvaliacoesAposEnvio.addEventListener('click', () => mostrarSecao('listar-avaliacoes'));

filtroPontuacao.addEventListener('change', carregarAvaliacoes);

btnAdmin.addEventListener('click', () => {
    if (isAdminMode) {
        desativarModoAdmin();
    } else {
        mostrarModalAdmin();
    }
});

btnSairAdmin.addEventListener('click', desativarModoAdmin);

async function verificarLoginAdmin() {
    const senha = adminSenhaInput.value.trim();
    
    if (!senha) {
        loginError.textContent = 'Digite a senha';
        loginError.classList.remove('hidden');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/verificar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ senha })
        });
        
        const resultado = await response.json();
        
        if (resultado.autenticado) {
            ativarModoAdmin();
            fecharModais();
        } else {
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

btnConfirmarExclusao.addEventListener('click', () => {
    console.log('Objeto para exclusão (confirmação):', avaliacaoParaExcluir);
    
    if (!avaliacaoParaExcluir || !avaliacaoParaExcluir.id || avaliacaoParaExcluir.id === 'undefined') {
        console.error('ID inválido na confirmação de exclusão');
        alert('Erro: ID da avaliação inválido');
        fecharModais();
        return;
    }
    
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

btnCancelarExclusao.addEventListener('click', () => {
    avaliacaoParaExcluir = null;
    fecharModais();
});

closeModalButtons.forEach(button => {
    button.addEventListener('click', fecharModais);
});

window.addEventListener('click', (e) => {
    if (e.target === modalAdmin) {
        fecharModais();
    }
    if (e.target === modalConfirmarExclusao) {
        fecharModais();
    }
});

formAvaliacao.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    limparErros();
    
    let temErro = false;
    let primeiroElementoComErro = null;
    
    const nomeCliente = document.getElementById('nome_cliente').value.trim();
    if (!nomeCliente) {
        mostrarErro(document.getElementById('nome_cliente'), 'Por favor, informe seu nome.');
        temErro = true;
        if (!primeiroElementoComErro) primeiroElementoComErro = document.getElementById('nome_cliente');
    }
    
    const nomeFuncionario = document.getElementById('nome_funcionario').value.trim();
    if (!nomeFuncionario) {
        mostrarErro(document.getElementById('nome_funcionario'), 'Por favor, informe o nome do funcionário.');
        temErro = true;
        if (!primeiroElementoComErro) primeiroElementoComErro = document.getElementById('nome_funcionario');
    }
    
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
    
    if (!validarPontuacao()) {
        mostrarErroPontuacao('Por favor, selecione uma pontuação.');
        temErro = true;
        if (!primeiroElementoComErro) primeiroElementoComErro = ratingContainer;
    }
    
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
        if (primeiroElementoComErro) {
            primeiroElementoComErro.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
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
        
        formAvaliacao.classList.add('hidden');
        successMessage.classList.remove('hidden');
        
    } catch (error) {
        console.error('Erro ao enviar avaliação:', error);
        alert(`Erro ao enviar avaliação: ${error.message}`);
    }
});

btnNewEvaluation.addEventListener('click', () => {
    formAvaliacao.reset();
    
    limparErros();
    
    successMessage.classList.add('hidden');
    formAvaliacao.classList.remove('hidden');
});

document.addEventListener('DOMContentLoaded', () => {
    mostrarSecao('nova-avaliacao');
});

formAdminLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    verificarLoginAdmin();
});

 