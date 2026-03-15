# Setup Frontend React

## Desenvolvimento

```bash
npm run dev
```

Acessa em `http://localhost:5173`

O servidor está configurado para fazer proxy de `/api` para `http://localhost:8080` (CodeIgniter).

### Exemplo de chamada API:

```javascript
const response = await fetch('/api/suas-rotas');
```

## Estrutura

```
frontend/
├── src/
│   ├── App.jsx          # Componente raiz
│   ├── App.css
│   ├── main.jsx         # Entry point
│   └── ...
├── public/              # Assets estáticos
├── vite.config.js       # Configuração Vite
├── package.json
└── index.html
```

## Em Produção

1. Faça o build: `npm run build`
2. Os arquivos estarão em `public/app/`
3. CodeIgniter serve tudo normalmente
4. Acessa via: `sua-url.com/app/`

## APIs do CodeIgniter

Configure em `src/` para chamar suas rotas:

```javascript
// Exemplo
fetch('/api/restaurantes')
  .then((res) => res.json())
  .then((data) => console.log(data));
```
