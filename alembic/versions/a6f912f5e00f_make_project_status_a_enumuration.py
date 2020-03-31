"""make project status a enumuration

Revision ID: a6f912f5e00f
Revises: 
Create Date: 2020-03-30 13:59:12.603514

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.orm.session import Session
from sqlalchemy.sql import table

# revision identifiers, used by Alembic.
revision = 'a6f912f5e00f'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###

    status_table = op.create_table('project_status_type',
    sa.Column('project_status_id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.Text(), nullable=True),
    sa.PrimaryKeyConstraint('project_status_id')
    )

    project_status_data = []
    conn = op.get_bind()
    for data_type in conn.execute("SELECT DISTINCT status FROM project;"):
        project_status_data.append({'name': data_type[0]})

    op.bulk_insert(status_table, project_status_data)

    matching_status_type_sql = sa.text("""
        SELECT * FROM project_status_type WHERE name = :status_text;
    """)
    update_sql = sa.text(
        """UPDATE project 
        SET status_id = :status_id 
        WHERE project.project_id = :project_id"""
    )
    with op.batch_alter_table("project") as batch_op:
        batch_op.add_column(
                      sa.Column(
                          'status_id',
                          sa.Integer,
                          nullable=True
                      )
                  )

    for project in conn.execute("SELECT project_id,  status FROM project;"):
        res = conn.execute(matching_status_type_sql, status_text=project.status).first()
        conn.execute(update_sql, status_id=res.project_status_id, project_id=project.project_id)
    with op.batch_alter_table("project") as batch_op:
        batch_op.drop_column( 'status')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    # op.add_column('project', sa.Column('status', sa.TEXT(), nullable=True))
    # op.drop_constraint(None, 'project', type_='foreignkey')
    with op.batch_alter_table("project") as batch_op:
        batch_op.add_column(sa.Column('status', sa.TEXT(), nullable=True))

    conn = op.get_bind()
    update_sql = sa.text(
        """UPDATE project 
        SET status = :status_text 
        WHERE project.project_id = :project_id"""
    )
    for project in conn.execute("SELECT project_id, status_id FROM project;"):
        status_text = conn.execute(
            """SELECT  name from project_status_type where project_status_id = :status_id""", status_id=project.status_id).first().name
        conn.execute(update_sql, status_text=status_text,
                     project_id=project.project_id)
    op.drop_table('project_status_type')
    with op.batch_alter_table("project") as batch_op:
        batch_op.drop_column('status_id')


    # TODO: covert projects status to equal the value of the matching status.id from the project_status_type table
    # ### end Alembic commands ###
