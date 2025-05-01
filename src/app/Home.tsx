import Header from "../components/Header";
import Post from '../components/Post';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <Header />
      <div className="post-feed">
        <Post />
        <Post 
          imageUrl="/images/img2.png"
          caption="Every day is a new day. Try to smile!"
          username="nature_lover"
          timePosted="3 hours ago"
        />
        <Post 
          imageUrl="/images/img4.png"
          caption="Beautiful beach spotted on morning run!!"
          username="coffee_addict"
          timePosted="5 hours ago"
        />
        <Post 
          imageUrl="/images/accountPic3.png"
          caption="Weekend vibes with friends"
          username="party_person"
          timePosted="1 day ago"
        />
        <Post 
          imageUrl="/images/img3.png"
          caption="Exploring new places"
          username="world_explorer"
          timePosted="2 days ago"
        />
      </div>
    </div>
  );
};

export default Home;
