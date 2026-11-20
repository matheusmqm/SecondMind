"""Testes do chunking_service: quebra o texto das páginas em pedaços (chunks).

Padrão de todo teste: ARRANGE (preparar a entrada), ACT (chamar a função),
ASSERT (conferir o resultado com `assert`).

Nota: chunk_size=50 vira 200 caracteres (cada "token" conta 4), que é o mínimo.
"""

from app.services.chunking_service import chunk_pages

# Um parágrafo de 80 caracteres, para montar textos de tamanho previsível.
def paragrafo(letra: str) -> str:
    return letra * 80


def test_sem_paginas_nao_gera_chunks():
    assert chunk_pages([], chunk_size=50, chunk_overlap=0) == []


def test_paginas_so_com_espacos_nao_geram_chunks():
    pages = [(1, "   \n\n   ")]
    assert chunk_pages(pages, chunk_size=50, chunk_overlap=0) == []


def test_texto_curto_vira_um_unico_chunk():
    pages = [(1, "Olá, mundo.")]

    chunks = chunk_pages(pages, chunk_size=50, chunk_overlap=0)

    assert len(chunks) == 1
    assert chunks[0].content == "Olá, mundo."
    assert chunks[0].page_start == 1
    assert chunks[0].page_end == 1


def test_nenhum_chunk_passa_do_tamanho_maximo():
    # 10 parágrafos de 80 caracteres = muito mais que 200 de uma vez.
    texto = "\n\n".join(paragrafo(letra) for letra in "ABCDEFGHIJ")

    chunks = chunk_pages([(1, texto)], chunk_size=50, chunk_overlap=0)

    assert len(chunks) > 1
    assert all(len(c.content) <= 200 for c in chunks)


def test_indices_comecam_em_zero_e_sao_sequenciais():
    texto = "\n\n".join(paragrafo(letra) for letra in "ABCDEF")

    chunks = chunk_pages([(1, texto)], chunk_size=50, chunk_overlap=0)

    assert [c.index for c in chunks] == list(range(len(chunks)))


def test_chunk_guarda_a_pagina_de_inicio_e_de_fim():
    # Uma página curta seguida de outra: o chunk atravessa as duas.
    pages = [(1, "Texto da página um."), (2, "Texto da página dois.")]

    chunks = chunk_pages(pages, chunk_size=50, chunk_overlap=0)

    assert len(chunks) == 1
    assert chunks[0].page_start == 1
    assert chunks[0].page_end == 2


def test_sem_overlap_os_chunks_nao_repetem_texto():
    texto = "\n\n".join(paragrafo(letra) for letra in "ABCD")

    chunks = chunk_pages([(1, texto)], chunk_size=50, chunk_overlap=0)

    # [A, B] e [C, D]: nenhum parágrafo aparece duas vezes.
    assert len(chunks) == 2
    assert chunks[0].content == paragrafo("A") + "\n" + paragrafo("B")
    assert chunks[1].content == paragrafo("C") + "\n" + paragrafo("D")


def test_com_overlap_o_ultimo_paragrafo_se_repete_no_proximo_chunk():
    texto = "\n\n".join(paragrafo(letra) for letra in "ABCD")

    # chunk_overlap=20 tokens = 80 caracteres = cabe exatamente 1 parágrafo.
    chunks = chunk_pages([(1, texto)], chunk_size=50, chunk_overlap=20)

    ultimo_do_primeiro = chunks[0].content.split("\n")[-1]
    primeiro_do_segundo = chunks[1].content.split("\n")[0]
    assert ultimo_do_primeiro == primeiro_do_segundo


def test_paragrafo_gigante_sem_pontuacao_e_cortado_em_janelas():
    pages = [(1, "x" * 500)]

    chunks = chunk_pages(pages, chunk_size=50, chunk_overlap=0)

    assert len(chunks) > 1
    assert all(len(c.content) <= 200 for c in chunks)
