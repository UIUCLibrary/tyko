import os.path
from tyko.run import init_database
from sqlalchemy import create_engine

CONFIG_FILE = "config.cfg"
SQLLITE_FILE = "tyko.db"


def create_new_config_file(config_file: str, db_uri: str) -> None:
    print("making a config file")

    with open(config_file, "w", encoding="utf-8") as f:
        f.write(f"SQLALCHEMY_DATABASE_URI = '{db_uri}'")


def main():
    config_file = CONFIG_FILE

    db_file = os.path.join(os.path.abspath("."), SQLLITE_FILE)
    db_uri = f'sqlite:///{db_file}'

    if not os.path.exists(config_file):
        create_new_config_file(config_file, db_uri)
        print(f"Generated: {config_file}")

    if os.path.exists(db_file):
        os.remove(db_file)
    init_database(create_engine(db_uri))
    print(f"Initialized db file {db_file}")


if __name__ == '__main__':
    main()
