import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/storage';
// import * as admin from 'firebase-admin';
import {combineAll, first, flatMap, map, mergeAll, switchMap} from 'rxjs/operators';
import {combineLatest, forkJoin, zip} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private MATERIALS = 'materials';
  private SCHEDULE = 'schedule';
  private USERS = 'users';
  private CLIENTS = 'clients';
  private ORDERS = 'orders';
  private STATUS = 'status';
  private NOTIFICATION = 'notification';

  constructor(private afs: AngularFirestore,
              private afAuth: AngularFireAuth) {
  }

  // FIREBASE CALLS
  private get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  async createNotification(value) {
    const exist = await this.checkNotificationExist(value.order.id);
    if (!exist['order']) {
     // value.userRequest = await this.getUserId();
      value.ready = false;
      return this.create(this.NOTIFICATION, value);
    }

    return value;

  }

  updateNotification(value) {
    return this.update(this.NOTIFICATION, value);
  }

  getNotifications() {
    return this.getAll(this.NOTIFICATION);
  }

  getNotification(id) {
    return this.getById(this.NOTIFICATION, id);
  }

  deleteNotification(id) {
    return this.delete(this.NOTIFICATION, id);
  }

  // Materials
  createMaterial(value) {
    return this.create(this.MATERIALS, value);
  }

  updateMaterial(value) {
    return this.update(this.MATERIALS, value);
  }

  getMaterials() {
    return this.getAll(this.MATERIALS);
  }

  getMaterial(id) {
    return this.getById(this.MATERIALS, id);
  }

  deleteMaterial(id) {
    return this.delete(this.MATERIALS, id);
  }

  // Schedule
  createSchedule(value) {
    return this.create(this.SCHEDULE, value);
  }

  updateSchedule(value) {
    return this.update(this.SCHEDULE, value);
  }

  getSchedules() {
    const events = this.afs.collection(this.SCHEDULE, ref => ref.orderBy('autoincrement', 'asc'))
        .valueChanges({idField: 'id'});

    return events.pipe(
        switchMap(eventsCollection => {
          const usersObservable = eventsCollection.map(
              event => {
                return this.afs.doc(`${this.USERS}/${event['users'][0]}`)
                    .valueChanges()
                    .pipe(first());
              });

          return combineLatest(
              ...usersObservable
          )
              .pipe(map((...users) => {
                    eventsCollection.forEach((event, index) => {
                      const userId = event['users'][0];
                      users[0][index]['id'] = userId;
                      event['users'][0] = users[0][index];
                    });
                    return eventsCollection;
                  })
              );
        })
    );
  }

 getSchedulesByDoctor(idDoctor) {
    const events = this.afs.collection(this.SCHEDULE, ref => ref.where('users', 'array-contains', idDoctor))
        .valueChanges({idField: 'id'});

     return events.pipe(
         switchMap(eventsCollection => {
             const usersObservable = eventsCollection.map(
                 event => {
                     return this.afs.doc(`${this.USERS}/${event['users'][0]}`)
                         .valueChanges()
                         .pipe(first());
                 });

             const patientsObservable = eventsCollection.map(
                 event => {
                     return this.afs.doc(`${this.USERS}/${event['patient']}`)
                         .valueChanges()
                         .pipe(first());
                 });

             return combineLatest(
                 ...usersObservable,
                 ...patientsObservable
             )
                 .pipe(map((...data) => {
                         const half = Math.ceil(data[0].length / 2);
                         const patients = data[0].splice(half, half);
                         const users = data[0];

                         eventsCollection.forEach((event, index) => {
                             const userId = event['users'][0];
                             const patientId = event['patient'];

                             users[index]['id'] = userId;
                             patients[index]['id'] = patientId;

                             event['users'][0] = users[index];
                             event['patient']  = patients[index];
                         });
                         return eventsCollection;
                     })
                 );
         })
     );
    }

  getSchedule(id) {
    return this.getById(this.SCHEDULE, id);
  }

  deleteSchedule(id) {
    return this.delete(this.SCHEDULE, id);
  }

  // Users
  createUser(value) {
    return this.create(this.USERS, value);
  }

  updateUser(value) {
    this.getAdminUsers();
    return this.update(this.USERS, value);
  }

  getUsers() {
    return this.getAll(this.USERS);
  }

  getUser(id) {
    return this.getById(this.USERS, id);
  }

  deleteUser(id) {
    return this.delete(this.USERS, id);
  }

  getAdminUsers() {
    /*
    const auth = admin.initializeApp().auth();
    auth.listUsers().then( users => {
      console.log('ADMIN users ' , users);
    });*/
  }

  // Status
  createStatus(value) {
    return this.create(this.STATUS, value);
  }

  updateStatus(value) {
    return this.update(this.STATUS, value);
  }

  getStatusAll() {
    return this.getAll(this.STATUS);
  }

  getStatus(id) {
    return this.getById(this.STATUS, id);
  }

  deleteStatus(id) {
    return this.delete(this.STATUS, id);
  }

  // Clients
  createClient(value) {
    return this.create(this.CLIENTS, value);
  }

  updateClient(value) {
    return this.update(this.CLIENTS, value);
  }

  getClients() {
    return this.getAll(this.CLIENTS);
  }

  getClient(id) {
    return this.getById(this.CLIENTS, id);
  }

  deleteClient(id) {
    return this.delete(this.CLIENTS, id);
  }

  // Orders
  createOrder(value) {
    return this.create(this.ORDERS, value);
  }

  async updateOrder(value) {
    const exist = await this.checkNotificationExist(value.id);
    if (exist['order']) {
      this.deleteNotification(exist['id']);
    }

    return this.update(this.ORDERS, value);
  }

  getOrders() {
    const orders = this.afs.collection(this.ORDERS, ref => ref.orderBy('date', 'desc'))
        .valueChanges({idField: 'id'});

    //this.deleteMultiple(this.MATERIALS, 'a')
    return orders.pipe(
        switchMap(ordersCollection => {

          const clientObservable = ordersCollection.map(
              order => this.afs.doc(`${this.CLIENTS}/${order['client']}`)
                  .valueChanges()
                  .pipe(first())
          );

          const statusObservable = ordersCollection.map(
              order => this.afs.doc(`${this.STATUS}/${order['status']}`)
                  .valueChanges()
                  .pipe(first())
          );

          const usersObservable = ordersCollection.map(
              order => this.afs.doc(`${this.USERS}/${order['user']}`)
                  .valueChanges()
                  .pipe(first())
          );

          return combineLatest(
              ...clientObservable,
              ...statusObservable,
              ...usersObservable,
              this.afs.collection(this.MATERIALS, ref => ref.orderBy('name', 'asc')).valueChanges({idField: 'id'})
          )
              .pipe(map((...clients) => {
                    const materials = clients[0].pop();
                    const third = Math.ceil(clients[0].length / 3);
                    const status = clients[0].splice(third, third);

                    const half = Math.ceil(clients[0].length / 2);
                    const users = clients[0].splice(half, half);

                    ordersCollection.forEach((order, index) => {

                      clients[0][index] ? clients[0][index].id = order['client'] : null;
                      status[index] ? status[index].id = order['status'] : null;
                      users[index] ? users[index].id = order['user'] : null;

                      order['client'] = clients[0][index];
                      order['status'] = status[index];
                      order['user'] = users[index];

                      if (order['status']) {
                        order['status'].hex = order['status'].color.substring(1);
                      }

                      for (const item of order['items']) {
                        if (item.material) {
                          item.material = materials.find(m => m.id === item.material);
                        }
                      }
                    });

                    return ordersCollection;
                  })
              );
        })
    );

  }

  getOrder(id) {
    const orderMain = this.afs.doc(`${this.ORDERS}/${id}`).valueChanges();

    return orderMain.pipe(
        switchMap(ordersCollection => {
          const idClient = ordersCollection['client'];
          const idStatus = ordersCollection['status'];
          const idUser = ordersCollection['user'];

          const clientObservable = this.afs.doc(`${this.CLIENTS}/${idClient}`)
              .valueChanges()
              .pipe(first());

          const statusObservable = this.afs.doc(`${this.STATUS}/${idStatus}`)
              .valueChanges()
              .pipe(first());

          const usersObservable = this.afs.doc(`${this.USERS}/${idUser}`)
              .valueChanges()
              .pipe(first());

          return combineLatest(
              clientObservable,
              statusObservable,
              usersObservable,
              this.afs.collection(this.MATERIALS, ref => ref.orderBy('name', 'asc')).valueChanges({idField: 'id'})
          )
              .pipe(map(([clients, status, user, materials]) => {
                    clients['id'] = idClient;
                    user['id'] = idUser;

                    if (status) {
                      status['id'] = idStatus;
                    }


                    ordersCollection['id'] = id;
                    ordersCollection['client'] = clients;
                    ordersCollection['status'] = status;
                    ordersCollection['user'] = user;

                    if (ordersCollection['status']) {
                      ordersCollection['status'].hex = ordersCollection['status'].color.substring(1);
                    }

                    for (const item of ordersCollection['items']) {
                      if (item.material) {
                        item.material = materials.find(m => m.id === item.material);
                      }
                    }

                    return ordersCollection;
                  })
              );

        })
    );

  }

  deleteOrder(id) {
    return this.delete(this.ORDERS, id);
  }

  async getUserByAuthId() {
    const user = await this.getCurrentUser();
    return this.afs.collection(this.USERS, ref => ref.where('adminID', '==', user.uid).limit(1))
    .valueChanges({idField: 'id'})
    .pipe(flatMap(users => users));
  }

  // Notification
  private async checkNotificationExist(orderID) {
    return this.afs.collection(this.NOTIFICATION, ref => ref.where('order.id', '==', orderID))
        .get()
        .toPromise()
        .then(data => {
          let resp = {};

          for (const d of data.docs) {
            resp = d.data();
            resp['id'] = d.id;
          }

          return resp;
        });
  }

  private getCurrentUser() {
    return this.afAuth.auth.currentUser;
  }

  private getLastRecord(collection, field = 'autoincrement') {
    return this.afs.collection(collection, ref => ref.orderBy(field, 'desc').limit(1))
        .get()
        .toPromise()
        .then(data => {
          let resp = {};

          for (const d of data.docs) {
            resp = d.data();
          }

          return resp;
        });
  }

  private async create(collection, value) {
    const timestamp = this.timestamp;
    const last = await this.getLastRecord(collection);
    const current = await this.getCurrentUser();

    const autoincrement = last && last['autoincrement'] ? last['autoincrement'] += 1 : 1;

    value['createdBy'] = current.email;
    value['autoincrement'] = autoincrement;
    value['updatedAt'] = timestamp;
    value['createAt'] = timestamp;

    this.afs.collection(collection).add(value);

    return value;
  }

  private delete(collection, id) {
    return this.afs.collection(collection)
        .doc(id)
        .delete();
  }

  private deleteMultiple(collection, search) {
    this.afs.collection(collection, ref => ref.where('name', '==', search).limit(500)).get()
        .subscribe(querySnapshot => {
          console.log('querySnapshot ', querySnapshot);

          const batch = this.afs.firestore.batch();

          querySnapshot.forEach(doc => {
            // For each doc, add a delete operation to the batch
            batch.delete(doc.ref);
          });

          // Commit the batch
          batch.commit();
        });
  }

  private getById(collection, id) {
    return this.afs.doc(`${collection}/${id}`)
        .valueChanges()
        .pipe(map(doc => {
          return {
            id,
            ...doc
          };
        }));
  }

  private getAll(collection) {
    let field = 'name';
    if (collection === this.SCHEDULE) {
      field = 'autoincrement';
    }
    return this.afs.collection(collection, ref => ref.orderBy(field, 'asc')).valueChanges({idField: 'id'});
  }

  private async update(collection, value) {
    const id = value.id;
    delete (value.id);

    if (!value.autoincrement) {
      const last = await this.getLastRecord(collection);
      const autoincrement = last && last['autoincrement'] ? last['autoincrement'] += 1 : 1;
      value['autoincrement'] = autoincrement;
    }

    const timestamp = this.timestamp;
    const current = await this.getCurrentUser();
    value['updatedAt'] = timestamp;
    value['updatedBy'] = current.email;

    if (!value['createdAt']) {
      value['createdAt'] = timestamp;
    }

    return this.afs.collection(collection)
        .doc(id)
        .set(value);
  }

}
