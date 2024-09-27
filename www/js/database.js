// Função para inicializar o banco de dados
document.addEventListener('deviceready', initDatabase, false);
var db;

function initDatabase() {
  db = window.sqlitePlugin.openDatabase({ name: 'AlarmMe.db', location: 'default' });

  db.transaction(function(tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT, message TEXT)', [], 
      function(tx, res) {
        console.log("Tabela criada com sucesso ou já existe.");
      }, 
      function(tx, error) {
        console.log("Erro ao criar tabela: " + error.message);
      });
  });

  // Exibir mensagens salvas quando o banco de dados for inicializado
  displaySavedMessages();
}

// Função para adicionar uma data e mensagem
function addMessage(date, message) {
  db.transaction(function(tx) {
    tx.executeSql('INSERT INTO messages (date, message) VALUES (?, ?)', [date, message], 
      function(tx, res) {
        console.log("Mensagem adicionada com sucesso.");
        displaySavedMessages(); // Atualiza as mensagens após inserir
      }, 
      function(tx, error) {
        console.log("Erro ao adicionar mensagem: " + error.message);
      });
  });
}

// Função para apagar uma mensagem pelo ID
function deleteMessage(id) {
  db.transaction(function(tx) {
    tx.executeSql('DELETE FROM messages WHERE id = ?', [id], 
      function(tx, res) {
        console.log("Mensagem excluída com sucesso.");
        displaySavedMessages(); // Atualiza a lista após excluir
      }, 
      function(tx, error) {
        console.log("Erro ao excluir mensagem: " + error.message);
      });
  });
}

// Função para exibir as mensagens salvas
function displaySavedMessages() {
  db.transaction(function(tx) {
    tx.executeSql('SELECT * FROM messages', [], 
      function(tx, res) {
        var savedMessages = document.querySelector('.datas-salvas');
        savedMessages.innerHTML = ''; // Limpa as mensagens anteriores

        for (var i = 0; i < res.rows.length; i++) {
          var item = res.rows.item(i);
          // Adiciona um botão para excluir cada mensagem
          savedMessages.innerHTML += `
            <p>
              <strong>Data:</strong> ${item.date} <br>
              <strong>Mensagem:</strong> ${item.message} <br>
              <button onclick="deleteMessage(${item.id})">Excluir</button>
            </p>`;
        }

        if (res.rows.length === 0) {
          savedMessages.innerHTML = '<p>Nenhuma mensagem salva.</p>';
        }
      }, 
      function(tx, error) {
        console.log("Erro ao recuperar mensagens: " + error.message);
      });
  });
}

// Evento para escutar o envio do formulário
document.getElementById('dateMessageForm').addEventListener('submit', function(e) {
  e.preventDefault(); // Evita o recarregamento da página

  var date = document.getElementById('date').value;
  var message = document.getElementById('message').value;

  if (date && message) {
    addMessage(date, message); // Adiciona a data e a mensagem no banco de dados
    document.getElementById('dateMessageForm').reset(); // Limpa o formulário
  } else {
    alert('Por favor, preencha todos os campos.');
  }
});