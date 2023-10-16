# -*- coding: utf-8 -*-
"""
Created on Tue Oct  5 11:34:40 2021

@author: yuuta.nishiyama
"""
from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin, LoginManager, login_user, current_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
import os
from datetime import datetime, timedelta
import pytz
import pandas as pd


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///user.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.urandom(24)
db = SQLAlchemy(app)

app.permanent_session_lifetime = timedelta(minutes=10) 

login_manager = LoginManager()
login_manager.init_app(app)

timeDispformat = '%Y/%m/%d %H:%M'


############ ORMクラス ############
# ユーザー情報
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    email = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(512), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    first_name_kana = db.Column(db.String(50), nullable=False)
    last_name_kana = db.Column(db.String(50), nullable=False)
    postal_code = db.Column(db.String(7), nullable=False)
    address1 = db.Column(db.String(255), nullable=False)
    address2 = db.Column(db.String(255), nullable=False)
    tel = db.Column(db.String(11))
    birthday = db.Column(db.String(8), nullable=False)
    carNumber = db.Column(db.String(4), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, 
                           default=datetime.now(pytz.timezone('Asia/Tokyo')))

    def toDict(self):
        return {'id' : self.id,
                'email' : self.email,
                'password' : self.password,
                'first_name' : self.first_name,
                'last_name' : self.last_name,
                'first_name_kana' : self.first_name_kana,
                'last_name_kana' : self.last_name_kana,
                'postal_code' : self.postal_code,
                'address1' : self.address1,
                'address2' : self.address2,
                'tel' : self.tel,
                'birthday' : self.birthday,
                'carNumber' : self.carNumber,
                'created_at' : self.created_at
        }


# 駐車場情報
class Parking(db.Model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    title = db.Column(db.String(50), nullable=False)
    postal_code = db.Column(db.String(7), nullable=False)
    address1 = db.Column(db.String(120), nullable=False)
    address2 = db.Column(db.String(120), nullable=False)
    tel = db.Column(db.String(11), nullable=False)
    inoutdoor = db.Column(db.String(1), nullable=False) # (0)屋外、(1)屋内
    mustcall = db.Column(db.String(1), nullable=False) # (0)出し入れ時に連絡が不要、(1)出し入れ時に連絡が必要
    usableTypeNum = db.Column(db.String(1), nullable=False) # (0)3ナンバー、(1)5ナンバー
    usableSize = db.Column(db.String(1), nullable=False) # (0)155cm未満、(1)155 ～ 170cm
    max_day = db.Column(db.Integer, nullable=True)
    min_day = db.Column(db.Integer, nullable=True)
    price_day = db.Column(db.Integer, nullable=False)
    etc = db.Column(db.String(500), nullable=True)
    lon = db.Column(db.Float, nullable=False)
    lat = db.Column(db.Float, nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False,
                           default=datetime.now(pytz.timezone('Asia/Tokyo')))
#未使用
    price_hour = db.Column(db.Integer)
    price_month = db.Column(db.Integer)
    max_hour = db.Column(db.Integer)
    min_hour = db.Column(db.Integer)
    max_month = db.Column(db.Integer)
    min_month = db.Column(db.Integer)

    def toDict(self):
        return {'id' : self.id,
                'title' : self.title,
                'address1' : self.address1,
                'address2' : self.address2,
                'tel' : self.tel,
                'inoutdoor' : self.inoutdoor,
                'mustcall' : self.mustcall,
                'usableTypeNum' : self.usableTypeNum,
                'usableSize' : self.usableSize,
                'max_day' : self.max_day,
                'min_day' : self.min_day,
                'price_day' : self.price_day,
                'etc' : self.etc,
                'lon' : self.lon,
                'lat' : self.lat
                }

# # 駐車場オーナー情報
# class Owner(db.Model):
#     id = db.Column(db.Integer, primary_key=True, nullable=False)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     park_id = db.Column(db.Integer, db.ForeignKey('parking.id'), nullable=False)

#     def toDict(self):
#         return {'id' : self.id,
#                 'user_id' : self.user_id,
#                 'park_id' : self.park_id
#         }

# 予約情報
class Reserve(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    park_id = db.Column(db.Integer, db.ForeignKey('parking.id'), nullable=False)
    resv_at = db.Column(db.DateTime, nullable=False, 
                        default=datetime.now(pytz.timezone('Asia/Tokyo'))) # 予約日時
    use_start = db.Column(db.DateTime, nullable=False) # 利用開始日時
    use_end =  db.Column(db.DateTime, nullable=False) # 利用終了日時
    resv_status = db.Column(db.Integer, nullable=False) # (0)予約なし,(1)予約ずみ,(2)ご利用済み

    def toDict(self):
        return {'id' : self.id,
                'user_id' : self.user_id,
                'park_id' : self.park_id,
                # 'resv_at' : self.resv_at,
                # 'use_start' : self.use_start,
                # 'use_end' : self.use_end,
                'resv_at' : f'{self.resv_at:%Y/%m/%d %H:%M:%S}',
                'use_start' : f'{self.use_start:%Y/%m/%d %H:%M:%S}',
                'use_end' : f'{self.use_end:%Y/%m/%d %H:%M:%S}',
                'resv_status' : self.resv_status
        }

############


@login_manager.user_loader
def load_user(user_id):
    print(f'ID>>>{user_id}')
    return User.query.get(int(user_id))


@app.route('/')
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        print(f'email:{email}, password:{password}')
        user = User.query.filter_by(email=email).first()
        # if user and check_password_hash(user.password, password):
        if user and (user.password==password):# デバッグ用にハッシュ化無し
            print('ログイン成功')
            # ログイン成功時の処理
            login_user(user)
            return redirect(url_for('mainForm'))
        else:
            print('ログイン失敗')
            # ログイン失敗時の処理
            return render_template('login.html', error='email or passwordが違っています。')
    elif request.method == 'GET':
        return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect('/login')


@app.route('/userRegistration', methods=['GET', 'POST'])
def userRegistration():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        password_confirm = request.form.get('password_confirm')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        first_name_kana = request.form.get('first_name_kana')
        last_name_kana = request.form.get('last_name_kana')
        postal_code = request.form.get('postal_code')
        address1 = request.form.get('address1')
        address2 = request.form.get('address2')
        tel = request.form.get('tel')
        birthday = request.form.get('birthday')
        carNumber = request.form.get('carNumber')
        
        if password != password_confirm:
            return render_template('userRegistration.html', error='Passwords do not match')

        user = User.query.filter_by(email=email).first()
        if user:
            return render_template('userRegistration.html', error='Email address already registered')

        new_user = User(
            email=email,
            # password=generate_password_hash(password, method='sha256'),
            password=password,# デバッグ用にハッシュ化無し
            first_name=first_name,
            last_name=last_name,
            first_name_kana=first_name_kana,
            last_name_kana=last_name_kana,
            postal_code=postal_code,
            address1=address1,
            address2=address2,
            tel=tel,
            birthday=birthday,
            carNumber=carNumber
            )
        db.session.add(new_user)
        db.session.commit()

        # 登録完了後の処理
        return redirect(url_for('registrationComplete'))
    else:
        return render_template('userRegistration.html')


@app.route('/registrationComplete', methods=['GET','POST'])
def registrationComplete():
    return render_template('registrationComplete.html')


@app.route('/mainForm', methods=['GET','POST'])
@login_required
def mainForm():
    if request.method=='POST':
        park_id = request.form.get('park_id')
        use_start = datetime.strptime(request.form.get('use_start'), '%Y/%m/%d %H:%M:%S')
        use_end = datetime.strptime(request.form.get('use_end'), '%Y/%m/%d %H:%M:%S')

        # 駐車場DBからデータを転送
        parking = Parking.query.filter_by(id=park_id).first().toDict()
        return render_template('confirmationOfApplicationDetails.html', 
                               parking=parking, 
                               use_start=use_start, 
                               use_end=use_end
                               )
    else:
        # 駐車場DBからデータを転送
        user = User.query.filter_by(id=current_user.id).first()
        parkings = Parking.query.all()
        parklist = []
        for park in parkings:
            d1 = park.toDict()
            parklist.append(d1)
        # 予約DBからデータを転送
        reserves = Reserve.query.all()
        reservelist = []
        for reserve in reserves:
            d2 = reserve.toDict()
            reservelist.append(d2)
        return render_template('mainForm.html', parklist=parklist, reservelist=reservelist,user=user)
        

@app.route('/settingChange', methods=['GET','POST'])
@login_required
def settingChange():
    user = User.query.filter_by(id=current_user.id).first()
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        password_confirm = request.form.get('password_confirm')
        first_name = request.form.get('first_name')
        last_name = request.form.get('last_name')
        first_name_kana = request.form.get('first_name_kana')
        last_name_kana = request.form.get('last_name_kana')
        postal_code = request.form.get('postal_code')
        address1 = request.form.get('address1')
        address2 = request.form.get('address2')
        tel = request.form.get('tel')
        birthday = request.form.get('birthday')
        carNumber = request.form.get('carNumber')
        
        if password != password_confirm:# デバッグ用
            return render_template('settingChange.html', 
                                   error='Passwords do not match', 
                                   user=user
                                   )

        # user = User.query.filter_by(email=email).first()
        # if user:
        #     return render_template('settingChange.html', error='Email address already registered')

        user.email=email
        # user.password=generate_password_hash(password, method='sha256')
        user.password=password # デバッグ用にハッシュ化無し
        user.first_name=first_name
        user.last_name=last_name
        user.first_name_kana=first_name_kana
        user.last_name_kana=last_name_kana
        user.postal_code=postal_code
        user.address1=address1
        user.address2=address2
        user.tel=tel
        user.birthday=birthday
        user.carNumber=carNumber
        
        db.session.add(user)
        db.session.commit()

        # 登録完了後の処理
        return render_template('settingChange.html', user=user, error='登録変更完了')
    else:
        return render_template('settingChange.html', user=user)


@app.route('/settingChangeComplete', methods=['GET','POST'])
@login_required
def settingChangeComplete():
    user = User.query.filter_by(id=current_user.id).first()
    if request.method=='POST':
        return render_template('mainForm.html')
    else:
        return render_template('mainForm.html')


@app.route('/usageStats', methods=['GET','POST'])
@login_required
def usageStats():
    
    reserves = Reserve.query.all()
    for reserve in reserves:
        use_start = reserve.use_start
        use_end = reserve.use_end
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        if use_end < today : # ご利用済み
            reserve.resv_status = 0
        elif today < use_start: # 予約済み
            reserve.resv_status = 1
        else: # ご利用中
            reserve.resv_status = 2
        db.session.commit()
    
    if request.method=='GET':
        # 駐車場DBから予約されたデータだけを抽出し転送
        join_query = db.session.query(User, Parking, Reserve).\
            join(Reserve, User.id == Reserve.user_id).\
            join(Parking, Reserve.park_id == Parking.id).\
            filter(User.id == current_user.id)
        
        result = join_query.all()
        reservelist = []
        for row in result:
            # user = row.User.__dict__
            parking = row.Parking.__dict__
            reserve = row.Reserve.__dict__
            data = {}
            # data.update(user)
            data.update(parking)
            data.update(reserve)
            reservelist.append(data)
        return render_template('usageStats.html', reservelist=reservelist)

    else:
        pass


@app.route('/parkingRegistration', methods=['GET','POST'])
@login_required
def parkingRegistration():
    user = User.query.filter_by(id=current_user.id).first()
    parking = Parking.query.filter_by(owner_id=current_user.id).first()

    if request.method=='POST':
        # 駐車場情報の更新の場合
        if parking:
            ### POSTのFormから変更を反映
            if request.form.get('mustcall')=='on':
                parking.mustcall = '1'
            else:
                parking.mustcall = '0'
            parking.postal_code     = request.form.get('postal_code')
            parking.address1        = request.form.get('address1')
            parking.address2        = request.form.get('address2')
            parking.inoutdoor       = request.form.get('inoutdoor')
            parking.tel             = request.form.get('tel')
            parking.usableTypeNum   = request.form.get('usableTypeNum')
            parking.usableSize      = request.form.get('usableSize')
            parking.price_day       = int(request.form.get('price_day'))
            parking.max_day         = int(request.form.get('max_day'))
            parking.etc             = request.form.get('etc')
            parking.lon             = float(request.form.get('lon'))
            parking.lat             = float(request.form.get('lat'))
            parking.owner_id        = current_user.id

        # 駐車場情報の新規登録の場合
        else:
            ### POSTのFormからの入力を反映
            if request.form.get('mustcall')=='on':
                mustcall = '1'
            else:
                mustcall = '0'
            parking = Parking(
                title = current_user.last_name+'邸駐車場',
                postal_code     = request.form.get('postal_code'),
                address1        = request.form.get('address1'),
                address2        = request.form.get('address2'),
                inoutdoor       = request.form.get('inoutdoor'),
                mustcall        = mustcall,
                tel             = request.form.get('tel'),
                usableTypeNum   = request.form.get('usableTypeNum'),
                usableSize      = request.form.get('usableSize'),
                price_day       = int(request.form.get('price_day')),
                max_day         = int(request.form.get('max_day')),
                etc             = request.form.get('etc'),
                lon             = float(request.form.get('lon')),
                lat             = float(request.form.get('lat')),
                owner_id        = current_user.id
            )
        # 駐車場DBの更新
        db.session.add(parking)
        db.session.commit()
        return render_template('parkingRegistrationComplete.html')

    elif request.method=='GET':
        # 駐車場の登録がある場合、
        if parking:
            return render_template('parkingRegistration.html', parking=parking)
        # 駐車場の登録がない場合、
        else:
            parking = Parking(max_day=31, price_day=0, etc='', tel=user.tel)
            return render_template('parkingRegistration.html', parking=parking)

@app.route('/usageStatsDetails', methods=['GET','POST'])
@app.route('/usageStatsDetails/<reserve_id>')
@login_required
def usageStatsDetails(reserve_id=None):
    if request.method=='POST':
        pass
    else:
        # 予約情報と駐車場DBのデータを取得し、遷移・転送
        reserve = Reserve.query.filter_by(id=reserve_id).first()
        parking = Parking.query.filter_by(id=reserve.park_id).first()
        return render_template('usageStatsDetails.html', reserve=reserve.toDict(), parking=parking.toDict())


@app.route('/deleteReserve', methods=['GET','POST'])
@app.route('/deleteReserve/<reserve_id>')
@login_required
def deleteReserve(reserve_id=None):
    if request.method=='POST':
        pass
    else:
        # 予約情報をDBから削除し、遷移・転送
        reserve = Reserve.query.filter_by(id=reserve_id).first()
        db.session.delete(reserve)
        db.session.commit()

        return redirect('/usageStats')


@app.route('/applicationComplete', methods=['GET','POST'])
@login_required
def applicationComplete():
    return render_template('applicationComplete.html')


@app.route('/confirmationOfApplicationDetails', methods=['GET','POST'])
@login_required
def confirmationOfApplicationDetails():
    if request.method=='POST':
        pass
        park_id = request.form.get('park_id')
        use_start = datetime.strptime(request.form.get('use_start'), '%Y-%m-%d %H:%M:%S')
        use_end = datetime.strptime(request.form.get('use_end'), '%Y-%m-%d %H:%M:%S')

        # 予約DBへ予約データを保存
        new_reserve = Reserve(user_id = current_user.id,
                              park_id = park_id,
                              use_start = use_start, # 利用開始日時
                              use_end = use_end,# 利用終了日時
                              resv_status = 1 # (0)予約なし,(1)予約ずみ,(2)ご利用済み
                              )
        # 予約DBにすでに予約されている期間であるかどうかを確認し、予約DBへ新規登録する
        db.session.add(new_reserve)
        db.session.commit()
        return render_template('applicationComplete.html')
    else:
        pass
        return render_template('confirmationOfApplicationDetails.html')


@app.route('/mailSend', methods=['GET','POST'])
@login_required
def mailSend():
    return render_template('mailSend.html')


### 管理者コンソール（仮）###

# 管理者コンソールログイン
@app.route('/loginAdmin', methods=['GET', 'POST'])
def loginAdmin():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        print(f'email:{email}, password:{password}')
        user = User.query.filter_by(email=email).first()
        # if user and check_password_hash(user.password, password):
        if user and (user.password==password) and (user.address2=='武蔵台1-23-5'):
            print('ログイン成功')
            # ログイン成功時の処理
            login_user(user)
            return redirect(url_for('adminTop'))
        else:
            print('ログイン失敗')
            # ログイン失敗時の処理
            return render_template('loginAdmin.html', error='email or passwordが違っています。')
    elif request.method == 'GET':
        return render_template('loginAdmin.html')


# 管理者コンソールトップ
@app.route('/adminTop', methods=['GET','POST'])
@login_required
def adminTop():
    if request.method=='GET':
        return render_template('adminTop.html')
    elif request.method=='POST':
        pass


# 管理者コンソール 月次の利用履歴の表示と出力
@app.route('/adminDetailsMonth', methods=['GET','POST'])
@login_required
def adminDetailsMonth():

    # 駐車場DBから予約されたデータだけを抽出し転送
    join_query = db.session.query(User, Parking, Reserve).\
        join(Reserve, User.id == Reserve.user_id).\
        join(Parking, Reserve.park_id == Parking.id)
    result = join_query.all()
    
    reservelist = []
    # 先月の月初・末を取得
    today = datetime.today()
    lastMonth_start = (today - timedelta(days=today.day)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    lastMonth_end   = (today - timedelta(days=today.day)).replace(hour=23, minute=59, second=59, microsecond=0)
    
    for row in result:
        user = row.User.__dict__
        parking = row.Parking.__dict__
        reserve = row.Reserve.__dict__
        
        # 先月内の利用情報のみに限定
        if reserve['use_start'] > lastMonth_end:
            continue
        if reserve['use_end'] < lastMonth_start:
            continue
        
        # 利用開始・終了日が先月の期間をまたいでいる場合、月の開始・終了の日時に置き換える
        if reserve['use_start'] < lastMonth_start:
            reserve['use_start'] = lastMonth_start
        if reserve['use_end'] > lastMonth_end:
            reserve['use_end'] = lastMonth_end
        data = {}
        data.update(user)
        data.update(parking)
        data.update(reserve)
        data.update({'use_days':(reserve['use_end']-reserve['use_start']).days + 1}) # 利用日数の算出
        reservelist.append(data)

    if request.method=='GET':
        return render_template('adminDetailsMonth.html', reservelist=reservelist, lastMonth_start=lastMonth_start, lastMonth_end=lastMonth_end)
    elif request.method=='POST':
        pass

        
# 管理者コンソール 利用・予約状況の全履歴の表示
@app.route('/adminDetailsAll', methods=['GET','POST'])
@login_required
def adminDetailsAll():

    # 駐車場DBから予約されたデータだけを抽出し転送
    join_query = db.session.query(User, Parking, Reserve).\
        join(Reserve, User.id == Reserve.user_id).\
        join(Parking, Reserve.park_id == Parking.id)
    result = join_query.all()
    
    reservelist = []
    for row in result:
        user = row.User.__dict__
        parking = row.Parking.__dict__
        reserve = row.Reserve.__dict__
        data = {}
        data.update(user)
        data.update(parking)
        data.update(reserve)
        data.update({'use_days':(reserve['use_end']-reserve['use_start']).days + 1}) # 利用日数の算出
        reservelist.append(data)

    if request.method=='GET':
        return render_template('adminDetailsAll.html', reservelist=reservelist)
    elif request.method=='POST':
        pass
        # データベースからデータを取得します
        # data = query_database()

        # # データをCSVファイルに変換して保存します
        # csv_filename = "database_results.csv"
        # data.to_csv(csv_filename, index=False)

        # # ダウンロード用のレスポンスを返します
        # return send_file(csv_filename, as_attachment=True)    
    

## おまじない
if __name__ == "__main__":
    # app.run(debug=True, host='192.168.1.111', port=1919)
    app.run(debug=True, threaded=False)
    
