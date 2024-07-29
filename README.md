# Sistema Dani Fernandes

## Sistema para gerenciamento de estoque da empresa Dani Fernandes
#### Abaixo, segue a documentação da API.



## Documentação da API

### Produtos:

#### Seleciona todos os produtos e seus dados:

```http
  GET /produtos/
```

#### Receber informações de um produto específico

```http
  GET /produtos/InfoProduto?id=${id}
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `id`      | `int` | **Obrigatório**. O ID do produto que você quer |

#### Retornar Lotes

Seleciona todos os lotes cadastrados de um produto específico.

```http
  GET /produtos/Lotes?produto_id=${id}
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `id`      | `int` | **Obrigatório**. O ID do produto que você quer visualizar os lotes |


#### Retornar Aromas

Seleciona todos os aromas no banco de dados.

```http
  GET /produtos/Aromas
```

#### Info Aromas

Seleciona todos os produtos e as informações que possuêm aquele aroma.

```http
  GET /produtos/InfoAromas?cod_aroma=${cod_aroma}
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `cod_aroma`      | `int` | **Obrigatório**. O código do aroma que você deseja ver as informações |


### Estoque

#### Retornar contagem do estoque

Retorna a quantidade de estoque do local selecionado.

```http
  GET /estoque/QuantidadeEstoque?id=${id}
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `id`      | `int` | **Obrigatório**. O código do local que você deseja visualizar o estoque |

#### Locais

Retorna todos os locais cadastrados no banco de dados.

```http
  GET /estoque/Locais
```

#### Entrada

Insere a entrada de um produto no banco de dados

```http
  POST /estoque/Entrada
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `id`      | `int` | **Obrigatório**. O código do produto que será entrado. |
| `quantidade`      | `int` | **Obrigatório**. A quantidade de produtos que será entrado. |
| `lote`      | `string` | **Obrigatório**. O nome do lote que será entrado.
| `validade`      | `string` | **Obrigatório**. Validade do lote. |
| `fabricacao`      | `string` | **Obrigatório**. Data de Fabricação do Lote.
| `localArmazenado`      | `int` | **Obrigatório**. O código do local onde será armazenado. |
| `coluna`      | `string` | **Obrigatório**. A coluna onde será guardado o lote. |
| `quantidade_caixas`      | `int` | **Obrigatório**. A quantidade de caixas do lote. |


#### Saída

Insere a saída de um produto no banco de dados.

```http
  POST /estoque/Saida
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `id`      | `int` | **Obrigatório**. O código do produto que sairá. |
| `quantidade`      | `int` | **Obrigatório**. A quantidade de produtos que sairá. |
| `lote`      | `string` | **Obrigatório**. O nome do lote que sairá.
| `quantidade_caixas`      | `int` | **Obrigatório**. A quantidade de caixas do lote. |

### Usuários

#### Login

Realiza o login do usuário

```http
  POST /usuarios/Login
```

| Parâmetro   | Tipo       | Descrição                                   |
| :---------- | :--------- | :------------------------------------------ |
| `user`      | `string` | **Obrigatório**. O usuário que será logado. |
| `senha`      | `String` | **Obrigatório**. A senha do usuário para login. |



