from app import app
from app import db
from app import User
from app import Parking
from app import Reserve
# from app import Owner

############ DBを作成する #############
with app.app_context():
    db.create_all()


# ###### DBデータを確認する ######
# def getTable(Tbl):
#     tbl = Tbl.query.all()
#     rows = []
#     for row in tbl:
#         rows.append(row.toDict())
#     return rows

# with app.app_context():
#     tbl_user = getTable(User)
#     tbl_parking = getTable(Parking)
#     tbl_Reserve = getTable(Reserve)
#     tbl_owner = getTable(Owner)