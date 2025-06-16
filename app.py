from flask import Flask, jsonify
import oracledb

app = Flask(__name__)
PORT = 3000

# Modo thin (sem Oracle Client instalado)
oracledb.init_oracle_client()  # Opcional, só ativa se houver client

# Rota principal
@app.route("/produtos")
def produtos():
    try:
        connection = oracledb.connect(
            user="GINGER",
            password="SF6QxMuKe_",
            dsn="dbconnect.megaerp.online:4221/xepdb1",
            mode=oracledb.DEFAULT_AUTH
        )

        cursor = connection.cursor()
        cursor.execute("""
            SELECT * FROM MEGA.gg_vw_produtos@GINGER
            WHERE LOWER(PRO_ST_DESCRICAO) LIKE '%pr%'
        """)

        columns = [col[0] for col in cursor.description]
        rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return jsonify(rows)

    except Exception as e:
        return jsonify({"erro": str(e)}), 500

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
