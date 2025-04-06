import Header from "../components/Header";
import Post from '../components/Post'

const Home = () => {
  return (
    <>
      <Header />
      <div className = "post-feed">
        <Post /> {}
      </div>
    </>
  );
};

export default Home;
