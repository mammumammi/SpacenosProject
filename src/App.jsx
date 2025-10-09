import { useEffect } from "react";
import { db } from "./FirebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import Coingecko from "./components/CoinGecko";
import WhaleTracker from "./components/WhaleTracker";

function App() {
  useEffect(() => {
    const testFirestore = async () => {
      try {
        // Add a test document
        await addDoc(collection(db, "testCollection"), { message: "Hello Firebase!" });
        console.log("Document written successfully!");

        // Read documents back
        const snapshot = await getDocs(collection(db, "testCollection"));
        snapshot.forEach((doc) => {
          console.log(doc.id, "=>", doc.data());
        });
      } catch (e) {
        console.error("Error:", e);
      }
    };
    testFirestore();
  }, []);

  return (
    <div className="p-8 text-center">
      <Coingecko/>
      <WhaleTracker/>
    </div>
  );
}

export default App;
