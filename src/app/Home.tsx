import Header from "../components/Header";
import Post from '../components/Post';
import '../styles/Home.css';
import { useUser } from './userData';

const Home = () => {
  const { currentUser } = useUser();

  return (
    <div className="home-container">
      <Header />
      <div className="post-feed">
        <Post 
          id={1}
          currentUserId={currentUser?.id} 
        />
        <Post 
          id={2}
          imageUrl="/images/img2.png"
          caption="Every day is a new day. Try to smile!"
          username="nature_lover"
          timePosted="3 hours ago"
          currentUserId={currentUser?.id}
        />
        <Post 
          id={3}
          imageUrl="/images/img4.png"
          caption="Beautiful beach spotted on morning run!!"
          username="coffee_addict"
          timePosted="5 hours ago"
          currentUserId={currentUser?.id}
        />
        <Post 
          id={4}
          imageUrl="/images/accountPic3.png"
          caption="Weekend vibes with friends"
          username="party_person"
          timePosted="1 day ago"
          currentUserId={currentUser?.id}
        />
        <Post 
          id={5}
          imageUrl="/images/img3.png"
          caption="Exploring new places"
          username="world_explorer"
          timePosted="2 days ago"
          currentUserId={currentUser?.id}
        />
      </div>
    </div>
  );
};

export default Home;
