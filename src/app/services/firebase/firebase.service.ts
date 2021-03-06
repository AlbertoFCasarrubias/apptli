import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import {first, flatMap, map, switchMap} from 'rxjs/operators';
import {combineLatest, of} from 'rxjs';
import {Store} from '@ngxs/store';

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
    private LOGS = 'logs';

    constructor(private afs: AngularFirestore,
                private store: Store,
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

    // Schedule
    createSchedule(value) {
        return this.create(this.SCHEDULE, value);
    }

    updateSchedule(value) {
        return this.update(this.SCHEDULE, value);
    }

    getSchedules(usersInitial = null) {
        const events = this.afs.collection(this.SCHEDULE, ref => ref.orderBy('start', 'asc'))
            .valueChanges({idField: 'id'});

        if (usersInitial) {
            return events.pipe(
                switchMap(eventsCollection => {
                    return combineLatest(of(usersInitial)).pipe(
                        map(users => {
                            return this.updateEventUsers(eventsCollection, usersInitial);
                        })
                    );
                })
            );
        } else {
            return events.pipe(
                switchMap(eventsCollection => {
                    let usersIDs = [];
                    for(const event of eventsCollection) {
                        // @ts-ignore
                        for(const user of event.users){
                            usersIDs.push(user);
                        }

                        // @ts-ignore
                        for(const user of event.patient) {
                            usersIDs.push(user);
                        }
                    }

                    usersIDs = usersIDs.splice(0, usersIDs.length, ...(new Set(usersIDs))); //remove duplicates

                    const usersObservable = usersIDs.map(
                        user => {
                            return this.afs.doc(`${this.USERS}/${user}`)
                                .valueChanges()
                                .pipe(
                                    map(u =>{
                                        // @ts-ignore
                                        u.id = user;
                                        return u;
                                    })
                                );
                        });

                    return combineLatest(usersObservable).pipe(
                        map(users => {
                            return this.updateEventUsers(eventsCollection, users);
                        })
                    );
                })
            );
        }
    }

    private updateEventUsers(eventsCollection, users) {
        eventsCollection.forEach((event, i) => {
            // @ts-ignore
            event.users.forEach((user, j) =>{
                // @ts-ignore
                eventsCollection[i].users[j] = users.find( u => u.id == user);
            });

            // @ts-ignore
            event.patient.forEach((user, j) =>{
                // @ts-ignore
                eventsCollection[i].patient[j] = users.find( u => u.id == user);
            });

        });

        return eventsCollection;
    }

    getSchedulesByDoctor(idDoctor, usersInitial = null) {
        const events = this.afs.collection(this.SCHEDULE, ref => ref.where('users', 'array-contains', idDoctor))
            .valueChanges({idField: 'id'});

        if (usersInitial) {
            return events.pipe(
                switchMap(eventsCollection => {
                    return combineLatest(of(usersInitial)).pipe(
                        map(users => {
                            return this.updateEventUsers(eventsCollection, usersInitial);
                        })
                    );
                })
            );
        } else {
            return events.pipe(
                switchMap(eventsCollection => {
                    let usersIDs = [];
                    for(const event of eventsCollection) {
                        // @ts-ignore
                        for(const user of event.users){
                            usersIDs.push(user);
                        }

                        // @ts-ignore
                        for(const user of event.patient) {
                            usersIDs.push(user);
                        }
                    }

                    usersIDs = usersIDs.splice(0, usersIDs.length, ...(new Set(usersIDs))); //remove duplicates

                    const usersObservable = usersIDs.map(
                        user => {
                            return this.afs.doc(`${this.USERS}/${user}`)
                                .valueChanges()
                                .pipe(
                                    map(u =>{
                                        // @ts-ignore
                                        u.id = user;
                                        return u;
                                    })
                                );
                        });

                    return combineLatest(usersObservable).pipe(
                        map(users => {
                            return this.updateEventUsers(eventsCollection, users);
                        })
                    );
                })
            );
        }
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
        return this.update(this.USERS, value);
    }

    getUsers() {
        return this.getAll(this.USERS);
    }

    getUser(id) {
        return this.getById(this.USERS, id);
    }

    getUserByMail(mail) {
        return this.afs.collection(this.USERS, ref => ref.where('mail', '==', mail))
            .valueChanges({idField: 'id'});
    }

    deleteUser(id) {
        return this.delete(this.USERS, id);
    }

    getPatients(doctorID) {
        return this.afs.collection(this.USERS, ref => ref.where('patient', '==', doctorID))
            .valueChanges({idField: 'id'});
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
        console.log('checkNotificationExist');
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

    // LOGS
    log(value) {
        this.create(this.LOGS, value);
    }

    // COMMON FUNCTIONS
    private getCurrentUser() {
        return this.afAuth.currentUser;
    }

    private getLastRecord(collection, field = 'autoincrement') {
        console.log('getLastRecord');
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

        return this.afs.collection(collection).add(value)
            .then(docRef => {
                value.id = docRef.id;
                return value;
            });

    }

    private delete(collection, id) {
        console.log('delete');
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
        console.log('getById');
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
        console.log('getAll');
        let field = 'name';
        if (collection === this.SCHEDULE) {
            field = 'autoincrement';
        }
        return this.afs.collection(collection, ref => ref.orderBy(field, 'asc'))
            .valueChanges({idField: 'id'});
    }

    private async update(collection, value) {
        console.log('update');
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

        if(id){
            return this.afs.collection(collection)
                .doc(id)
                .set(value);
        }
    }

    public close(){

    }

}
