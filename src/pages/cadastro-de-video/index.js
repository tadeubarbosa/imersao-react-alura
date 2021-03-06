import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';

import categoriasRepository from '../../repositories/categorias';
import videosRepository from '../../repositories/videos';

import PageDefault from '../../components/PageDefault';
import useForm from '../../hooks/userForm';
import FormField from '../../components/FormField';
import FormButton from '../../components/FormButton';
import Loading from '../../components/Loading';

import Form from '../../components/Form';
import FormFooter from '../../components/FormFooter';
import FormMessage from '../../components/FormMessage';

function CadastroDeVideo() {
  const valoresIniciais = {
    url: '',
    titulo: '',
    categoria: '',
  };

  const { handleChange, valores } = useForm(valoresIniciais);
  const history = useHistory();

  const [message, setMessage] = useState('');
  const [isLoading, setLoadingStatus] = useState(true);
  const [errorOnLoading, setErrorLoadingStatus] = useState();
  const [categorias, setCategorias] = useState([]);
  const categoryTitles = categorias.map((categoria) => categoria.titulo);

  useEffect(() => {
    categoriasRepository.getAll()
      .then(async (content) => setCategorias([...content]))
      .catch((error) => setErrorLoadingStatus(error.message))
      .then(() => {
        setTimeout(() => setLoadingStatus(false), 200);
      });
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    if (!valores.titulo || !valores.url || !valores.categoria) {
      return setMessage('Preencha todos os campos!');
    }

    const categoriaSelecionada = categorias.find(({ titulo }) => titulo === valores.categoria);

    if (!categoriaSelecionada) {
      return setMessage(
        `Ops! A categoria <strong>${valores.categoria}</strong> não existe! Você pode cadastrar clicando no botão abaixo!`,
      );
    }

    const categoriaId = categoriaSelecionada.id;

    return videosRepository.create({
      url: valores.url,
      titulo: valores.titulo,
      categoriaId,
    })
      .then(() => {
        localStorage.setItem('_flash', JSON.stringify({
          type: 'success',
          message: 'Vídeo cadastrado com sucesso!',
        }));
      })
      .catch((error) => {
        localStorage.setItem('_flash', JSON.stringify({
          type: 'error',
          message: error.message,
        }));
      })
      .then(() => history.push('/'));
  }

  return (
    <PageDefault>

      {isLoading && <Loading />}

      {!isLoading && errorOnLoading && (
        <div id="LoadingError">
          <h1>{errorOnLoading}</h1>
        </div>
      )}

      {!isLoading && !errorOnLoading && (
        <Form onSubmit={handleSubmit}>

          <h1>Cadastro de vídeo</h1>

          <FormField
            label="Título"
            type="text"
            name="titulo"
            value={valores.titulo}
            onChange={handleChange}
          />

          <FormField
            label="Link do Vídeo"
            type="url"
            name="url"
            value={valores.url}
            onChange={handleChange}
          />

          <FormField
            label="Categoria"
            type="text"
            name="categoria"
            value={valores.categoria}
            onChange={handleChange}
            suggestions={categoryTitles}
          />

          <FormMessage message={message} />

          <FormButton>
            Cadastrar
          </FormButton>

          <FormFooter>
            <Link to="/cadastro/categoria">
              Cadastrar nova categoria
            </Link>

            <Link to="/">
              Ir para home
            </Link>
          </FormFooter>
        </Form>
      )}

    </PageDefault>
  );
}

export default CadastroDeVideo;
