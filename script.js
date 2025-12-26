// === Variáveis Globais (TODAS as variáveis LET/CONST devem vir AQUI, no topo absoluto do arquivo) ===
let filaSenhas = [];
let ultimasSenhasPorTipo = {
    emergencia: 0,
    consulta: 0,
    urgencia: 0,
    marcacao: 0
};
let pacientes = []; 
let prontuarios = [];
let ultimaDataSenha = null; // Variável para armazenar a data da última atualização

const tipos = {
    emergencia: "E",
    consulta: "C",
    urgencia: "U",
    marcacao: "M"
};


// === Funções auxiliares para localStorage (Definidas APENAS UMA VEZ, APÓS as variáveis globais) ===
function salvarEstado() {
    localStorage.setItem('filaSenhas', JSON.stringify(filaSenhas));
    localStorage.setItem('ultimasSenhasPorTipo', JSON.stringify(ultimasSenhasPorTipo));
    localStorage.setItem('pacientes', JSON.stringify(pacientes));
    localStorage.setItem('prontuarios', JSON.stringify(prontuarios));
    
    // Salva a data atual (formato YYYY-MM-DD)
    const hoje = new Date();
    localStorage.setItem('ultimaDataSenha', hoje.toISOString().slice(0, 10)); // YYYY-MM-DD
    
    console.log("Estado salvo no localStorage:", { filaSenhas, ultimasSenhasPorTipo, pacientes, prontuarios, ultimaDataSenha: hoje.toISOString().slice(0, 10) });
}

function carregarEstado() {
    const filaSalva = localStorage.getItem('filaSenhas');
    if (filaSalva) {
        filaSenhas = JSON.parse(filaSalva);
        console.log("Fila de senhas carregada do localStorage:", filaSenhas);
    } else {
        filaSenhas = [];
        console.log("Nenhuma fila de senhas no localStorage. Inicializando vazia.");
    }

    const ultimasSenhasPorTipoSalvas = localStorage.getItem('ultimasSenhasPorTipo');
    if (ultimasSenhasPorTipoSalvas) {
        ultimasSenhasPorTipo = JSON.parse(ultimasSenhasPorTipoSalvas);
        console.log("Últimas senhas por tipo carregadas:", ultimasSenhasPorTipo);
    } else {
        ultimasSenhasPorTipo = {
            emergencia: 0,
            consulta: 0,
            urgencia: 0,
            marcacao: 0
        };
        console.log("Nenhuma última senha por tipo no localStorage. Inicializando vazias.");
    }

    // Carrega a última data salva e compara com a de hoje
    const ultimaDataSalva = localStorage.getItem('ultimaDataSenha');
    const hoje = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD para comparação

    if (ultimaDataSalva && ultimaDataSalva !== hoje) { // Se existe data salva e é um novo dia
        console.log("Novo dia detectado! Resetando a numeração das senhas.");
        ultimasSenhasPorTipo = { // Reseta as contagens para zero para todos os tipos
            emergencia: 0,
            consulta: 0,
            urgencia: 0,
            marcacao: 0
        };
        filaSenhas = []; // Esvaziar a fila também, já que as senhas antigas não farão mais sentido
        salvarEstado(); // Salva o estado resetado imediatamente para persistir o reset
    } else if (!ultimaDataSalva) {
        console.log("Primeiro acesso ou localStorage limpo, preparando para o primeiro dia.");
    }

    const pacientesSalvos = localStorage.getItem('pacientes');
    if (pacientesSalvos) {
        pacientes = JSON.parse(pacientesSalvos);
        console.log("Pacientes carregados do localStorage:", pacientes);
    } else {
        pacientes = []; 
        console.log("Nenhum paciente no localStorage. Inicializando vazio.");
    }

    const prontuariosSalvos = localStorage.getItem('prontuarios');
    if (prontuariosSalvos) {
        prontuarios = JSON.parse(prontuariosSalvos);
        console.log("Prontuários carregados do localStorage:", prontuarios);
    } else {
        prontuarios = [];
        console.log("Nenhum prontuário no localStorage. Inicializando vazio.");
    }
    console.log("Estado carregado do localStorage.");
}

// === Chamada inicial para carregar o estado (APENAS UMA VEZ, APÓS declarações de variáveis e funções auxiliares) ===
carregarEstado();


// === FUNÇÃO PARA ALTERNAR TELAS (Definida APENAS UMA VEZ) ===
function showScreen(screenId) {
    const screens = document.querySelectorAll(".container");
    screens.forEach(screen => screen.classList.add("hidden"));
    document.getElementById(`${screenId}-screen`).classList.remove("hidden");

    console.log("Ativando tela:", screenId);

    // Se a tela ativada for a de recepção, atualize a exibição da senha
    if (screenId === "reception") { 
        console.log("Chamando atualizarProximaSenhaExibicao para tela de recepção. Fila atual antes da atualização:", filaSenhas);
        atualizarProximaSenhaExibicao();
    }
    // Se a tela ativada for a do médico, atualize a lista de pacientes
    if (screenId === "doctor") { 
        console.log("Chamando atualizarListaPacientes para tela do médico. Pacientes atuais antes da atualização:", pacientes);
        atualizarListaPacientes();
    }
    // Se a tela ativada for a de prontuários, limpar o campo de busca e os resultados anteriores
    if (screenId === "prontuarios") {
        const searchInput = document.getElementById("search-patient-name");
        if (searchInput) {
            searchInput.value = ""; // Limpa o campo de busca
        }
        const patientSearchList = document.getElementById("patient-search-list");
        if (patientSearchList) {
            patientSearchList.innerHTML = "<li>Digite um nome ou CPF para pesquisar.</li>"; // Limpa os resultados
        }
        const selectedRecordDetails = document.getElementById("selected-record-details");
        if (selectedRecordDetails) {
            selectedRecordDetails.classList.add("hidden"); // Oculta detalhes de prontuário
        }
    }
}


// === GERAR E GERENCIAR SENHAS ===
document.querySelectorAll(".button[data-type]").forEach(btn => {
    btn.addEventListener("click", () => {
        const tipo = btn.dataset.type;
        // Verifica se 'tipos[tipo]' é undefined. Isso causaria "undefined003".
        if (!tipos[tipo]) {
            console.error("Tipo de senha inválido ou não definido em 'tipos':", tipo);
            alert("Erro ao gerar senha: Tipo inválido.");
            return;
        }
        ultimasSenhasPorTipo[tipo]++;
        const numeroDaSenha = ultimasSenhasPorTipo[tipo];
        const numeroFormatado = tipos[tipo] + numeroDaSenha.toString().padStart(3, "0");
        filaSenhas.push(numeroFormatado);
        document.getElementById("ticket-display").textContent = `Senha gerada: ${numeroFormatado}`;
        salvarEstado(); // Salva o estado após gerar nova senha (incluindo a data)
        console.log("Senha gerada e fila atualizada:", filaSenhas);
        console.log("Últimas senhas por tipo (depois da geração):", ultimasSenhasPorTipo);
    });
});

// === RECEPÇÃO: CHAMAR PRÓXIMA SENHA ===
document.getElementById("call-next-password-btn").addEventListener("click", () => {
    const next = filaSenhas.shift(); // Pega a primeira senha da fila e a remove
    if (next) {
        document.getElementById("next-password-display").textContent = next;
        document.getElementById("called-password-display").textContent = next;
        console.log("Senha chamada:", next);
    } else {
        document.getElementById("reception-message").textContent = "Nenhuma senha na fila.";
        document.getElementById("reception-message").classList.remove("hidden");
        setTimeout(() => {
            document.getElementById("reception-message").classList.add("hidden");
        }, 3000);
        console.log("Nenhuma senha na fila para chamar.");
    }
    salvarEstado(); // Salva o estado após chamar a senha (fila foi modificada)
    console.log("Fila após chamada de senha:", filaSenhas);
    // IMPORTANTE: Adiciona esta linha para atualizar a exibição da próxima senha após a remoção
    atualizarProximaSenhaExibicao(); 
});

// Função para atualizar a exibição da próxima senha na tela de Recepção
function atualizarProximaSenhaExibicao() {
    console.log("Executando atualizarProximaSenhaExibicao. Fila atual:", filaSenhas);
    if (filaSenhas.length > 0) {
        document.getElementById("next-password-display").textContent = filaSenhas[0]; // Mostra a primeira da fila
        console.log("Próxima senha atualizada para:", filaSenhas[0]);
    } else {
        document.getElementById("next-password-display").textContent = "Nenhuma"; // Ou algo similar
        console.log("Nenhuma senha na fila, display definido para 'Nenhuma'.");
    }
    // Também é bom limpar a senha chamada se a fila estiver vazia
    if (filaSenhas.length === 0 && document.getElementById("called-password-display").textContent !== "Nenhuma") {
        document.getElementById("called-password-display").textContent = "Nenhuma";
        console.log("Senha chamada limpa.");
    }
}


// === CADASTRO DO PACIENTE ===
document.getElementById("patient-registration-form").addEventListener("submit", e => {
    e.preventDefault();

    const nome = document.getElementById("patient-name").value;
    const telefone = document.getElementById("patient-phone").value;
    const endereco = document.getElementById("patient-address").value;
    const cpf = document.getElementById("patient-cpf").value;
    const sintomas = document.getElementById("patient-symptoms").value;

    // LÓGICA CORRIGIDA para verificar CPF em pacientes (fila de espera) E prontuários
    const pacienteExistenteNaFila = pacientes.find(p => p.cpf === cpf);
    const prontuarioExistenteParaCpf = prontuarios.find(p => p.cpf === cpf);

    if (pacienteExistenteNaFila || prontuarioExistenteParaCpf) {
        alert("Erro: Já existe um paciente (ou prontuário) cadastrado com este CPF.");
        console.warn("Tentativa de cadastrar paciente com CPF duplicado:", cpf);
        return; // Impede o cadastro se o CPF for duplicado
    }

    const paciente = { nome, telefone, endereco, cpf, sintomas };
    pacientes.push(paciente);

    atualizarListaPacientes();
    salvarEstado(); // Salva o estado após cadastrar paciente
    console.log("Paciente cadastrado:", paciente);

    e.target.reset();
});

// === ATUALIZAR LISTA DE PACIENTES PARA O MÉDICO ===
function atualizarListaPacientes() {
    const lista = document.getElementById("patient-list-doctor");
    lista.innerHTML = ""; // Limpa a lista antes de preencher
    console.log("Atualizando lista de pacientes. Pacientes atuais:", pacientes);

    if (pacientes.length === 0) {
        lista.innerHTML = "<li>Nenhum paciente aguardando.</li>";
        console.log("Nenhum paciente aguardando.");
        return;
    }

    pacientes.forEach((paciente, index) => {
        const li = document.createElement("li");
        li.textContent = paciente.nome;
        li.style.cursor = "pointer";
        li.addEventListener("click", () => mostrarDetalhesPaciente(index));
        lista.appendChild(li);
    });
    console.log("Lista de pacientes atualizada no DOM.");
}

// === EXIBIR DETALHES PARA O MÉDICO ===
let pacienteAtualIndex = null;

function mostrarDetalhesPaciente(index) {
    pacienteAtualIndex = index;
    const paciente = pacientes[index];
    document.getElementById("current-patient-name-doctor").textContent = paciente.nome;
    document.getElementById("current-patient-phone-doctor").textContent = paciente.telefone;
    document.getElementById("current-patient-address-doctor").textContent = paciente.endereco;
    document.getElementById("current-patient-cpf-doctor").textContent = paciente.cpf;
    document.getElementById("current-patient-symptoms-doctor").textContent = paciente.sintomas;

    document.getElementById("current-patient-details-doctor").classList.remove("hidden");
    document.getElementById("medical-record-form").classList.remove("hidden");
    console.log("Detalhes do paciente exibidos:", paciente);
}

// === SALVAR PRONTUÁRIO ===
document.getElementById("record-form").addEventListener("submit", e => {
    e.preventDefault();
    if (pacienteAtualIndex === null) return;

    const paciente = pacientes[pacienteAtualIndex];

    const prontuario = {
        nome: paciente.nome,
        cpf: paciente.cpf,
        telefone: paciente.telefone,
        endereco: paciente.endereco,
        sintomas: paciente.sintomas,
        diagnostico: document.getElementById("diagnosis").value,
        tratamento: document.getElementById("treatment").value,
        observacoes: document.getElementById("observation").value
    };

    prontuarios.push(prontuario); // Adiciona o prontuário à lista em memória
    console.log("Prontuário adicionado à lista em memória:", prontuario);

    document.getElementById("record-form").reset();
    document.getElementById("medical-record-form").classList.add("hidden");
    document.getElementById("current-patient-details-doctor").classList.add("hidden");

    pacientes.splice(pacienteAtualIndex, 1); // Remove o paciente da lista de espera em memória
    console.log("Paciente removido da fila em memória. Nova lista de pacientes (antes de salvar):", pacientes);

    // ************ ALTERAÇÃO FEITA AQUI: A CHAMADA salvarEstado() AGORA É APENAS UMA E NO FINAL ************
    salvarEstado(); // Salva o estado completo APÓS todas as modificações
    console.log("Estado completo (incluindo prontuários e pacientes) salvo no localStorage.");
    
    atualizarListaPacientes(); // Atualiza a lista na tela do médico
    pacienteAtualIndex = null;
});

// === CONSULTAR PRONTUÁRIOS / PACIENTES ===
document.getElementById("search-patient-btn").addEventListener("click", () => {
    const termo = document.getElementById("search-patient-name").value.toLowerCase().trim();
    const lista = document.getElementById("patient-search-list");
    lista.innerHTML = "";
    document.getElementById("selected-record-details").classList.add("hidden");

    if (!termo) {
        lista.innerHTML = "<li>Digite um nome ou CPF para pesquisar.</li>";
        return;
    }

    // LÓGICA CORRIGIDA: Unifica a busca em pacientes (em espera) e prontuários (atendidos)
    const resultadosSet = new Set();

    // Adiciona pacientes da lista de espera
    pacientes.forEach(p => {
        if ((p.nome && p.nome.toLowerCase().includes(termo)) || (p.cpf && p.cpf.includes(termo))) {
            resultadosSet.add(JSON.stringify(p)); // Adiciona o objeto paciente completo
        }
    });

    // Adiciona prontuários (pacientes atendidos)
    prontuarios.forEach(pr => {
        if ((pr.nome && pr.nome.toLowerCase().includes(termo)) || (pr.cpf && pr.cpf.includes(termo))) {
            resultadosSet.add(JSON.stringify(pr)); // Adiciona o objeto prontuário completo
        }
    });

    const resultadosUnicos = Array.from(resultadosSet).map(s => JSON.parse(s));

    console.log("Buscando prontuários/pacientes por:", termo, "Resultados encontrados:", resultadosUnicos);

    if (resultadosUnicos.length === 0) {
        lista.innerHTML = "<li>Nenhum paciente encontrado com o termo informado.</li>";
        return;
    }

    resultadosUnicos.forEach(p => {
        const li = document.createElement("li");
        li.textContent = `${p.nome} - CPF: ${p.cpf}`;
        li.style.cursor = "pointer";
        li.addEventListener("click", () => mostrarDetalhesPacienteOuProntuario(p));
        lista.appendChild(li);
    });
});


// === EXIBIR DETALHES DE PACIENTE OU PRONTUÁRIO SELECIONADO ===
function mostrarDetalhesPacienteOuProntuario(pacienteSelecionado) {
    // Primeiro, busca se existe um prontuário para este paciente
    const prontuarioEncontrado = prontuarios.find(p => p.cpf === pacienteSelecionado.cpf);

    // Seleciona os elementos de exibição
    const recordPatientName = document.getElementById("record-patient-name");
    const recordPatientCpf = document.getElementById("record-patient-cpf");
    const recordPatientPhone = document.getElementById("record-patient-phone");
    const recordPatientAddress = document.getElementById("record-patient-address");
    const recordPatientSymptoms = document.getElementById("record-patient-symptoms");
    const recordDiagnosis = document.getElementById("record-diagnosis");
    const recordTreatment = document.getElementById("record-treatment");
    const recordObservation = document.getElementById("record-observation");

    // Limpa os campos antes de preencher
    recordPatientName.textContent = "";
    recordPatientCpf.textContent = "";
    recordPatientPhone.textContent = "";
    recordPatientAddress.textContent = "";
    recordPatientSymptoms.textContent = "";
    recordDiagnosis.textContent = "N/A"; // Define como N/A se não houver prontuário
    recordTreatment.textContent = "N/A";
    recordObservation.textContent = "N/A";

    // Preenche com os dados do cadastro (sempre existem)
    recordPatientName.textContent = pacienteSelecionado.nome || 'Não informado';
    recordPatientCpf.textContent = pacienteSelecionado.cpf || 'Não informado';
    recordPatientPhone.textContent = pacienteSelecionado.telefone || 'Não informado';
    recordPatientAddress.textContent = pacienteSelecionado.endereco || 'Não informado';
    recordPatientSymptoms.textContent = pacienteSelecionado.sintomas || 'Não informado';

    // Se encontrou um prontuário, sobrescreve os campos de diagnóstico/tratamento/observações
    if (prontuarioEncontrado) {
        recordDiagnosis.textContent = prontuarioEncontrado.diagnostico || 'Não informado';
        recordTreatment.textContent = prontuarioEncontrado.tratamento || 'Não informado';
        recordObservation.textContent = prontuarioEncontrado.observacoes || 'Não informado';
        console.log("Detalhes do prontuário exibidos:", prontuarioEncontrado);
    } else {
        console.log("Detalhes do paciente (apenas cadastro) exibidos:", pacienteSelecionado, " - Sem prontuário finalizado.");
    }

    document.getElementById("selected-record-details").classList.remove("hidden");
}

// === IMPRIMIR PRONTUÁRIO ===
document.getElementById("print-found-record-btn").addEventListener("click", () => {
    const printableArea = document.getElementById("selected-record-details");
    if (printableArea && !printableArea.classList.contains("hidden")) { // Verifica se a seção está visível
        const printWindow = window.open('', '_blank', 'height=600,width=800'); // _blank para abrir em nova aba
        printWindow.document.write('<html><head><title>Prontuário do Paciente</title>');
        // Adicione seus links de CSS aqui, se houver
        // Exemplo: printWindow.document.write('<link rel="stylesheet" href="style.css">'); 
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Detalhes do Prontuário</h1>'); 
        printWindow.document.write(printableArea.innerHTML); 
        printWindow.document.write('</body></html>');
        printWindow.document.close();

        // Pequeno atraso para garantir que o conteúdo foi renderizado antes de imprimir
        setTimeout(() => {
            printWindow.focus(); 
            printWindow.print(); 
            printWindow.close(); 
        }, 300); // Aumentado um pouco o atraso para mais compatibilidade
    } else {
        alert("Nenhum prontuário selecionado para impressão. Por favor, pesquise e selecione um paciente primeiro.");
        console.warn("Tentativa de imprimir sem prontuário selecionado.");
    }
    console.log("Tentando imprimir prontuário.");
});

// === Funções para Resetar o Sistema (Adicionada para 'zerar' tudo) ===
function resetarSistema() {
    // Zera as variáveis globais
    filaSenhas = [];
    ultimasSenhasPorTipo = {
        emergencia: 0,
        consulta: 0,
        urgencia: 0,
        marcacao: 0
    };
    pacientes = [];
    prontuarios = [];
    ultimaDataSenha = null; // Zera a data para garantir que o próximo dia será um "novo dia" ao carregar

    // Limpa o localStorage
    localStorage.removeItem('filaSenhas');
    localStorage.removeItem('ultimasSenhasPorTipo');
    localStorage.removeItem('pacientes');
    localStorage.removeItem('prontuarios');
    localStorage.removeItem('ultimaDataSenha');

    // Atualiza a interface do usuário se estiver visível
    document.getElementById("ticket-display").textContent = "Senha gerada: ---";
    document.getElementById("next-password-display").textContent = "Nenhuma";
    document.getElementById("called-password-display").textContent = "Nenhuma";
    
    // Se a tela de médico estiver visível, atualiza a lista de pacientes
    const doctorScreen = document.getElementById("doctor-screen");
    if (doctorScreen && !doctorScreen.classList.contains("hidden")) {
        atualizarListaPacientes();
    }
    // Oculta detalhes de paciente e formulário de prontuário, se estiverem visíveis
    const currentPatientDetailsDoctor = document.getElementById("current-patient-details-doctor");
    if (currentPatientDetailsDoctor) {
        currentPatientDetailsDoctor.classList.add("hidden");
    }
    const medicalRecordForm = document.getElementById("medical-record-form");
    if (medicalRecordForm) {
        medicalRecordForm.classList.add("hidden");
    }

    // Limpar a tela de prontuários também
    const searchInput = document.getElementById("search-patient-name");
    if (searchInput) searchInput.value = "";
    const patientSearchList = document.getElementById("patient-search-list"); 
    if (patientSearchList) patientSearchList.innerHTML = "<li>Nenhum paciente encontrado.</li>";
    const selectedRecordDetails = document.getElementById("selected-record-details");
    if (selectedRecordDetails) selectedRecordDetails.classList.add("hidden");

    console.log("Sistema resetado. Todos os dados foram limpos.");
    alert("Sistema resetado com sucesso! Todos os dados foram limpos.");

    // Opcional: Recarrega a página para garantir um estado limpo completo da UI
    // window.location.reload(); 
}

// === Funções para o Relógio em Tempo Real ===
function atualizarRelogio() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // Formato 24 horas
    };
    const formattedDateTime = now.toLocaleString('pt-BR', options);
    
    const timeDisplayElement = document.getElementById('current-time-display');
    if (timeDisplayElement) { // Garante que o elemento existe antes de tentar atualizar
        timeDisplayElement.textContent = formattedDateTime;
    }
}

// === Event Listener para DOMContentLoaded (Inicia o Relógio e outras lógicas iniciais) ===
// Este bloco garante que o script só tenta manipular o DOM depois que o HTML foi carregado.
document.addEventListener('DOMContentLoaded', () => {
    // Inicia o relógio
    atualizarRelogio(); // Atualiza o relógio imediatamente ao carregar
    setInterval(atualizarRelogio, 1000); // Atualiza a cada 1 segundo (1000 milissegundos)

    // Lógica opcional para iniciar em uma tela específica (descomente se necessário)
    // showScreen('reception'); 
});