"""Testes do query_engine: a "sandbox" de SQL que só deixa o modelo LER dados.

O DuckDB roda de verdade, em memória. O que mais importa aqui são as REJEIÇÕES:
garantir que nada além de um único SELECT passa.
"""

import pandas as pd
import pytest

from app.services.query_engine import QueryEngine, QueryError, TableInfo


# Uma "fixture" prepara algo que vários testes usam. Cada teste que a pede como
# parâmetro recebe um motor novo, já com a tabela `vendas` carregada.
@pytest.fixture
def engine():
    tabela = TableInfo(
        name="vendas",
        document_id="doc-1",
        filename="vendas.xlsx",
        sheet="Janeiro",
        df=pd.DataFrame({"produto": ["A", "B", "C"], "valor": [10, 20, 30]}),
    )
    motor = QueryEngine([tabela])
    yield motor
    motor.close()  # roda depois do teste, para limpar


# --- consultas válidas -----------------------------------------------------------------


def test_select_devolve_colunas_e_linhas(engine):
    resultado = engine.run("SELECT produto, valor FROM vendas ORDER BY valor")

    assert resultado.columns == ["produto", "valor"]
    assert resultado.rows == [["A", 10], ["B", 20], ["C", 30]]
    assert resultado.truncated is False


def test_soma_e_calculada_pelo_sql(engine):
    resultado = engine.run("SELECT SUM(valor) AS total FROM vendas")

    assert resultado.rows == [[60]]


def test_ponto_e_virgula_no_final_e_aceito(engine):
    resultado = engine.run("SELECT 1;")

    assert resultado.rows == [[1]]


# --- consultas rejeitadas ----------------------------------------------------------------


@pytest.mark.parametrize(
    "sql",
    [
        "",  # vazia
        "   ",  # só espaços
        "SELEC 1",  # SQL inválido
        "SELECT 1; SELECT 2",  # duas instruções
        "DROP TABLE vendas",  # apaga tabela
        "DELETE FROM vendas",  # apaga linhas
        "INSERT INTO vendas VALUES ('D', 40)",  # grava linhas
        "CREATE TABLE x (a INT)",  # cria tabela
    ],
)
def test_consultas_perigosas_ou_invalidas_sao_rejeitadas(engine, sql):
    with pytest.raises(QueryError):
        engine.run(sql)


def test_mensagem_explica_que_so_select_e_permitido(engine):
    with pytest.raises(QueryError, match="SELECT"):
        engine.run("DROP TABLE vendas")


def test_nao_deixa_ler_arquivos_do_computador(engine):
    # É um SELECT, mas tenta abrir um arquivo: o acesso externo está desligado.
    with pytest.raises(QueryError):
        engine.run("SELECT * FROM read_csv('qualquer.csv')")


def test_a_tabela_continua_intacta_depois_de_uma_tentativa_de_drop(engine):
    with pytest.raises(QueryError):
        engine.run("DROP TABLE vendas")

    assert engine.run("SELECT COUNT(*) FROM vendas").rows == [[3]]


# --- limite de linhas ---------------------------------------------------------------------
# O conftest.py define SQL_MAX_ROWS=5.


def test_resultado_grande_e_cortado_e_marcado_como_truncated(engine):
    resultado = engine.run("SELECT * FROM range(20)")

    assert len(resultado.rows) == 5
    assert resultado.truncated is True


def test_resultado_exatamente_no_limite_nao_e_truncated(engine):
    resultado = engine.run("SELECT * FROM range(5)")

    assert len(resultado.rows) == 5
    assert resultado.truncated is False


# --- tables_used --------------------------------------------------------------------------


def test_tables_used_encontra_a_tabela_citada(engine):
    usadas = engine.tables_used("SELECT * FROM vendas")

    assert [t.name for t in usadas] == ["vendas"]


def test_tables_used_nao_confunde_nomes_parecidos(engine):
    assert engine.tables_used("SELECT * FROM vendas_extra") == []
