import styles from "./App.module.scss";
import Slider from "./components/Slider";

function App() {
  return (
    <div className={styles.App}>
      <Slider>
        <div className={styles.slide + " " + styles.slide1}>
          <h1>First slide</h1>
        </div>
        <div className={styles.slide + " " + styles.slide2}>
          <h1>Second slide</h1>
        </div>
        <div className={styles.slide + " " + styles.slide3}>
          <h1>Third slide</h1>
        </div>
      </Slider>
    </div>
  );
}

export default App;
