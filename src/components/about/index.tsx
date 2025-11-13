import { Routes } from '@/constants/enums';
import MainHeading from '../main-heading';


async function About() {

  return (
    <section className='section-gap' id={Routes.ABOUT}>
      <div className='container text-center'>
        <MainHeading subTitle="our story" title="About Us" />
        <div className='text-accent max-w-md mx-auto mt-4 flex flex-col gap-4'>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
        </div>
      </div>
    </section>
  );
}

export default About;
