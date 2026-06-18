

const FormLogin = document.querySelector("#ContainerFormLogin");

function getUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios")) || [];
}

function Login(){
    
    FormLogin.addEventListener("submit", function(e){
        e.preventDefault();

        const Dados = new FormData(this);
        const email = Dados.get("email");
        const senha = Dados.get("senha");

        if(!email || !senha){
            alert("Por favor, insira informações em todos os campos!");
            return;
        }

        if(!email.includes("@") || !email.includes(".")){
            alert("Digite um email válido!");
            return;
        }

        //find verifica se o usuario existe
        const usuario = getUsuarios().find(
            user => user.email === email && user.senha === senha
        );

        if(usuario){
            alert("Seja Bem vindo," + usuario.nome);
            localStorage.setItem('currentUser', JSON.stringify(usuario));
            window.location.href = "../pages/home.html";
        }else{
            alert("Email ou senha incorretos.")
        }
    });

};
Login()