import { useRouter, type RouteComponent } from 'retend/router';
import type { PageMeta } from 'retend-server/client';
import { sty } from '@/utils';
import { Cell, If } from 'retend';
import { Button, Input } from '@/components/form-input';
import { Loader } from '@/components/loader';
import { ArrowIcon } from '@/components/icons/arrow-icon';
import { showToast } from '@/components/toast';
import { API_URL } from '@/constants';
import './coming-soon.scss';
import { state } from '@/state';

interface SuccessfulServerResponse<T> {
  success: true;
  data: T;
}

const addToListHandler = async (
  email: string
): Promise<SuccessfulServerResponse<{ message: string }>> => {
  const res = await fetch(`${API_URL}/mailing-list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error.message);
  return data;
};

const ComingSoon: RouteComponent<PageMeta> = () => {
  const router = useRouter();
  const { run: addToList, pending, error, data } = Cell.async(addToListHandler);

  const buttonSqueeze = Cell.derived(() => (pending.value ? 0.7 : 1));
  const handleSubmit = function (this: HTMLFormElement) {
    if (pending.value) return;

    const formData = new FormData(this);
    const email = formData.get('email') as string;
    addToList(email);
  };

  error.listen((err) => {
    if (!err) return;
    showToast({ message: `${err.message}`, timeout: 2500 });
  });

  data.listen((data) => {
    if (!data?.success) return;
    state.waitListSuccess.value = true;
    router.navigate('/coming-soon-waitlist-success');
  });

  return (
    <main id="ComingSoonPage">
      <h1>
        <span class="HeadingText">
          {sty('managing money')}
          <br /> {sty("shouldn't be hard")}.
        </span>
      </h1>

      <img src="/coins.svg" alt="Illustration of Dollar, Euro, and Yen coins" />

      <section>
        <p>
          <i>recoin</i> is your private, simple companion for managing finances.
          It aims to make things perfectly clear, so you can easily see where
          your money comes from and where it's headed.
        </p>
        <p>
          <i>recoin</i> offers a clear view of your cash flow, helping you
          understand spending habits and make informed financial decisions to
          achieve savings goals.
        </p>
        <p>Be the first to experience it.</p>
      </section>

      <form onSubmit--prevent={handleSubmit}>
        <Input
          container:class="EmailInput"
          name="email"
          required
          type="email"
          placeholder="Enter your email"
        />
        <Button
          class="SubmitButton"
          type="submit"
          squeezeX={buttonSqueeze}
          disabled={pending}
          Icon={() =>
            If(pending, {
              true: () => <Loader size="13px" />,
              false: ArrowIcon,
            })
          }
        >
          <span>
            {If(pending, {
              true: () => 'Joining',
              false: () => 'Join the waitlist',
            })}
          </span>
        </Button>
      </form>
    </main>
  );
};

export default ComingSoon;
