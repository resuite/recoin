import { useRouter } from 'retend/router';

const Index = () => {
   const { Link } = useRouter();
   return (
      <div>
         <h1>Hello, world!</h1>
         <Link href='/styleguide'>Go to styleguide</Link>
      </div>
   );
};

export default Index;
