import { Button } from '@/components/form-input';
import { Checkmark } from '@/components/icons/checkmark';
import { sty } from '@/utils';
import './coming-soon-waitlist-success.scss';

const ComingSoonWaitlistSuccess = () => {
  return (
    <main id="ComingSoonWaitlistSuccessPage">
      <section>
        <Checkmark />
        <h1>{sty("You're on the list!")}</h1>
        <p>
          We'll send updates and your early access invitation to your email.
        </p>
        <p>
          Keep an eye out, we'll be in touch the moment recoin is ready to
          launch.
        </p>
      </section>
      <Button width="300px">
        <span>View recoin's source</span>
      </Button>
    </main>
  );
};

export default ComingSoonWaitlistSuccess;
