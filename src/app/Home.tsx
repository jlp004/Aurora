import Header from "../components/Header";
import Post from '../components/Post';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <Header />
      <div className="post-feed">
        <Post />
      </div>
    </div>
  );
};

export default Home;
