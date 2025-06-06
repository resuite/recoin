import { useRouter, type RouteComponent } from "retend/router";
import type { PageMeta } from "retend-server/client";
import { Cell, If } from "retend";
import { useToast, Button } from "@recoin/components/ui";
import { Icon } from "@recoin/components/icons";
import { Input } from "retend-utils/components";
import { API_URL } from "@/constants";
import "./coming-soon.scss";
import { state } from "@/state";
import { Coins } from "coins";

const addToListHandler = async (
   email: string,
): Promise<SuccessfulServerResponse<{ message: string }>> => {
   const res = await fetch(`${API_URL}/mailing-list`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
   });
   const data = await res.json();
   if (!res.ok) throw new Error(data.error.message);
   return data;
};

const ComingSoon: RouteComponent<PageMeta> = () => {
   const router = useRouter();
   const { ToastContainer, showToast } = useToast();
   const addToList = Cell.async(addToListHandler);

   const handleSubmit = function (this: HTMLFormElement) {
      if (addToList.pending.get()) return;

      const formData = new FormData(this);
      const email = formData.get("email") as string;
      addToList.run(email);
   };

   addToList.error.listen((err) => {
      if (!err) return;
      showToast({ content: err.message, duration: 2500 });
   });

   addToList.data.listen((data) => {
      if (!data?.success) return;
      state.waitListSuccess.set(true);
      router.navigate("/coming-soon-waitlist-success");
   });

   return (
      <main id="ComingSoonPage">
         <h1>
            <span class="HeadingText">
               managing money
               <br /> shouldn't be hard
            </span>
         </h1>
         <Coins />
         <section>
            <p>
               <i>recoin</i> is your private, simple companion for managing
               finances. It aims to make things perfectly clear, so you can
               easily see where your money comes from and where it's headed.
            </p>
            <p>
               <i>recoin</i> offers a clear view of your cash flow, helping you
               understand spending habits and make informed financial decisions
               to achieve savings goals.
            </p>
            <p>Be the first to experience it.</p>
         </section>
         <form onSubmit--prevent={handleSubmit}>
            <Input
               name="email"
               required
               type="email"
               placeholder="Enter your email"
            />
            <Button
               class="SubmitButton"
               type="submit"
               disabled={addToList.pending}
            >
               {If(addToList.pending, {
                  true: () => (
                     <>
                        <Icon name="loader" />
                        <span>Joining</span>
                     </>
                  ),
                  false: () => (
                     <>
                        <Icon name="arrows" direction="" />
                        <span>Join the wait-list</span>
                     </>
                  ),
               })}
            </Button>
         </form>
         <ToastContainer />
      </main>
   );
};

export default ComingSoon;
