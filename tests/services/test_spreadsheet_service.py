"""Testes do spreadsheet_service: lê CSV/Excel e padroniza os dados.

Os arquivos de teste são criados na hora, em memória (bytes), então não
precisamos de nenhum arquivo no disco.
"""

import io
from datetime import date
from decimal import Decimal

import pandas as pd
import pytest

from app.services.spreadsheet_service import (
    SpreadsheetError,
    _normalize_columns,
    build_card,
    jsonable,
    parse,
    preview,
    table_name,
)


def csv_bytes(texto: str) -> bytes:
    return texto.encode("utf-8")


# --- table_name: nome da tabela SQL ---------------------------------------------------


# `parametrize` roda o MESMO teste várias vezes, uma para cada linha da lista.
@pytest.mark.parametrize(
    ("filename", "sheet", "file_type", "esperado"),
    [
        ("vendas_2025.xlsx", "Janeiro", "xlsx", "vendas_2025_janeiro"),
        ("Ocorrências 2025.csv", "x", "csv", "ocorrencias_2025"),  # tira acento e espaço
        ("2025.xlsx", "Janeiro", "xlsx", "t_2025_janeiro"),  # nome não pode começar com número
        (".xlsx", "Janeiro", "xlsx", "planilha_janeiro"),  # sem nome: usa "planilha"
    ],
)
def test_table_name(filename, sheet, file_type, esperado):
    assert table_name(filename, sheet, file_type) == esperado


# --- _normalize_columns: nomes de colunas ---------------------------------------------


def test_colunas_viram_snake_case_sem_acento():
    assert _normalize_columns(["Preço Unitário", "Nome"]) == ["preco_unitario", "nome"]


def test_colunas_repetidas_ganham_sufixo():
    assert _normalize_columns(["A", "A", "A"]) == ["a", "a_2", "a_3"]


def test_coluna_sem_nome_vira_col_n():
    assert _normalize_columns(["", "Valor"]) == ["col_1", "valor"]


def test_coluna_que_comeca_com_numero_ganha_prefixo():
    assert _normalize_columns(["2025"]) == ["c_2025"]


# --- parse: leitura de arquivos --------------------------------------------------------


def test_parse_csv_simples():
    tabelas = parse(csv_bytes("nome;idade\nAna;30\nBia;25\n"), "csv", "pessoas.csv")

    assert len(tabelas) == 1
    assert tabelas[0].sheet == "pessoas"
    assert list(tabelas[0].df.columns) == ["nome", "idade"]
    assert len(tabelas[0].df) == 2


def test_parse_converte_numeros_no_formato_brasileiro():
    # "1.234,50" é mil duzentos e trinta e quatro e cinquenta.
    tabelas = parse(csv_bytes("produto;valor\nA;1.234,50\nB;10,00\n"), "csv", "v.csv")

    valores = tabelas[0].df["valor"]
    assert pd.api.types.is_numeric_dtype(valores)
    assert valores.tolist() == [1234.5, 10.0]


def test_parse_converte_datas_no_formato_brasileiro():
    tabelas = parse(csv_bytes("dia;qtd\n01/02/2025;1\n15/03/2025;2\n"), "csv", "d.csv")

    dias = tabelas[0].df["dia"]
    assert pd.api.types.is_datetime64_any_dtype(dias)
    assert dias.iloc[0] == pd.Timestamp(2025, 2, 1)  # dia/mês/ano, não mês/dia


def test_parse_ignora_linhas_e_colunas_totalmente_vazias():
    tabelas = parse(csv_bytes("a;b;c\n1;2;\n;;\n3;4;\n"), "csv", "x.csv")

    assert list(tabelas[0].df.columns) == ["a", "b"]  # coluna "c" era toda vazia
    assert len(tabelas[0].df) == 2  # a linha vazia sumiu


def test_parse_excel_devolve_uma_tabela_por_aba():
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
        pd.DataFrame({"x": [1, 2]}).to_excel(writer, sheet_name="Janeiro", index=False)
        pd.DataFrame({"y": [3]}).to_excel(writer, sheet_name="Fevereiro", index=False)

    tabelas = parse(buffer.getvalue(), "xlsx", "vendas.xlsx")

    assert [t.sheet for t in tabelas] == ["Janeiro", "Fevereiro"]


def test_parse_csv_so_com_cabecalho_da_erro():
    with pytest.raises(SpreadsheetError):
        parse(csv_bytes("a;b\n"), "csv", "vazio.csv")


def test_parse_arquivo_corrompido_da_erro():
    with pytest.raises(SpreadsheetError):
        parse(b"isso nao e um excel", "xlsx", "quebrado.xlsx")


# --- jsonable: converte uma célula para algo que vira JSON ------------------------------


def test_jsonable_nan_e_nat_viram_none():
    assert jsonable(float("nan")) is None
    assert jsonable(pd.NaT) is None
    assert jsonable(None) is None


def test_jsonable_data_vira_texto_iso():
    assert jsonable(pd.Timestamp(2025, 2, 1)) == "2025-02-01"
    assert jsonable(date(2025, 2, 1)) == "2025-02-01"


def test_jsonable_decimal_vira_float():
    assert jsonable(Decimal("10.5")) == 10.5


def test_jsonable_numpy_vira_tipo_python():
    valor = pd.Series([7]).iloc[0]  # um numpy.int64

    assert jsonable(valor) == 7
    assert type(jsonable(valor)) is int


# --- build_card e preview ----------------------------------------------------------------


def test_build_card_descreve_a_planilha():
    tabela = parse(csv_bytes("produto;valor\nA;10\nB;20\n"), "csv", "vendas.csv")[0]

    card = build_card("vendas.csv", tabela)

    assert "Spreadsheet: vendas.csv" in card
    assert "2 rows, 2 columns" in card
    assert "valor (number, min 10, max 20" in card


def test_preview_limita_as_linhas_mas_informa_o_total():
    dados = csv_bytes("n;m\n1;a\n2;b\n3;c\n")

    resultado = preview(dados, "csv", "n.csv", max_rows=2)

    assert len(resultado[0]["rows"]) == 2
    assert resultado[0]["total_rows"] == 3
