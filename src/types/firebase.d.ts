interface FirebaseApp {
  analytics(): any;
  database(): FirebaseDatabase;
  storage(): any;
}

interface FirebaseDatabase {
  ref(path: string): DatabaseReference;
}

interface DatabaseReference {
  on(eventType: string, callback: (snapshot: DataSnapshot) => void): void;
  off(eventType: string, callback: (snapshot: DataSnapshot) => void): void;
  set(value: any): Promise<void>;
}

interface DataSnapshot {
  val(): any;
}

interface Firebase {
  initializeApp(config: any): FirebaseApp;
  analytics(app: FirebaseApp): any;
  database(app: FirebaseApp): FirebaseDatabase;
  storage(app: FirebaseApp): any;
}

declare global {
  interface Window {
    firebase: Firebase;
  }
} 