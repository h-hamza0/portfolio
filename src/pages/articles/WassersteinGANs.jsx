import ArticleLayout from '../../components/ArticleLayout';
import Sidenote from '../../components/Sidenote';
import Figure from '../../components/Figure';
import { M, MBlock } from '../../components/Math';
import References from '../../components/References';

const refs = [
  {
    id: 'arjovsky2017',
    text: 'Arjovsky, M., Chintala, S., & Bottou, L. (2017). Wasserstein GAN. arXiv:1701.07875.',
  },
  {
    id: 'villani2009',
    text: 'Villani, C. (2009). Optimal Transport: Old and New. Springer.',
  },
  {
    id: 'goodfellow2014',
    text: 'Goodfellow, I. et al. (2014). Generative Adversarial Networks. NeurIPS.',
  },
];

export default function WassersteinGANs() {
  return (
    <ArticleLayout
      title="Wasserstein GANs, from Metric Spaces to a Loss Function"
      dek="Why swapping Jensen–Shannon divergence for the Wasserstein distance fixes vanishing gradients — built up from first principles through Kantorovich–Rubinstein duality."
      date="May 2, 2026"
      readTime="18 min"
      tags={['generative models', 'optimal transport', 'GANs']}
    >
      <p>
        The original GAN formulation<Sidenote number={1}>
          The generator <M>{'G'}</M> and discriminator <M>{'D'}</M> play a minimax game: <M>{'D'}</M> tries to
          separate real from fake, <M>{'G'}</M> tries to fool it. See Goodfellow et al., 2014.
        </Sidenote> trains a discriminator to distinguish real data from generated samples,
        and a generator to fool it. It works — but it is notoriously unstable to train, and the instability has a
        precise cause: the divergence it minimizes doesn&rsquo;t behave well when the two distributions barely overlap.
      </p>

      <p>
        This article builds up the Wasserstein GAN<Sidenote number={2}>
          Arjovsky, Chintala &amp; Bottou, 2017 — the paper that reframed the GAN objective around optimal transport.
        </Sidenote> from the ground up: what a metric on probability distributions actually needs to satisfy, why
        Jensen&ndash;Shannon divergence fails that test in the regime GANs operate in, and how the Kantorovich&ndash;Rubinstein
        duality turns an intractable transport problem into something you can literally implement as a
        discriminator with a gradient penalty.
      </p>

      <h2>The problem with Jensen&ndash;Shannon</h2>

      <p>
        The original GAN objective corresponds, at the optimal discriminator, to minimizing the Jensen&ndash;Shannon
        divergence between the real distribution <M>{'\\mathbb{P}_r'}</M> and the generator&rsquo;s distribution{' '}
        <M>{'\\mathbb{P}_g'}</M>:
      </p>

      <MBlock>{'\\mathrm{JS}(\\mathbb{P}_r, \\mathbb{P}_g) = \\tfrac{1}{2} D_{KL}(\\mathbb{P}_r \\| M) + \\tfrac{1}{2} D_{KL}(\\mathbb{P}_g \\| M)'}</MBlock>

      <p>
        where <M>{'M = \\tfrac{1}{2}(\\mathbb{P}_r + \\mathbb{P}_g)'}</M>. The trouble is that when{' '}
        <M>{'\\mathbb{P}_r'}</M> and <M>{'\\mathbb{P}_g'}</M> have disjoint or nearly disjoint support &mdash; which is
        the typical case early in training, when the generator is still bad<Sidenote number={3}>
          If <M>{'\\mathbb{P}_r'}</M> and <M>{'\\mathbb{P}_g'}</M> are supported on low-dimensional manifolds embedded
          in a high-dimensional space, generic manifolds intersect on a measure-zero set. This is essentially always
          true early in training.
        </Sidenote> &mdash; the JS divergence saturates at <M>{'\\log 2'}</M> and its gradient with respect to the
        generator&rsquo;s parameters vanishes almost everywhere. The discriminator becomes perfect and stops
        providing useful signal.
      </p>

      <Figure
        caption="Two distributions with disjoint support: JS divergence is flat (and uninformative) almost everywhere except at the point of overlap, while the Wasserstein distance decreases smoothly as they move closer."
      />

      <h2>A metric that sees distance, not just overlap</h2>

      <p>
        The Earth Mover&rsquo;s distance, or Wasserstein-1 distance, asks a different question: if you had to move
        probability mass from <M>{'\\mathbb{P}_r'}</M> to reshape it into <M>{'\\mathbb{P}_g'}</M>, how much
        work would that take? Formally, over the set <M>{'\\Pi(\\mathbb{P}_r, \\mathbb{P}_g)'}</M> of all joint
        distributions (couplings) with those two marginals:
      </p>

      <MBlock>{'W(\\mathbb{P}_r, \\mathbb{P}_g) = \\inf_{\\gamma \\in \\Pi(\\mathbb{P}_r, \\mathbb{P}_g)} \\ \\mathbb{E}_{(x,y)\\sim\\gamma}\\big[\\, \\|x - y\\| \\,\\big]'}</MBlock>

      <p>
        Unlike JS or KL divergence, this stays finite and continuous even when the two distributions don&rsquo;t
        overlap at all &mdash; it degrades gracefully into an ordinary notion of distance between supports, not a
        binary overlap/no-overlap signal.<Sidenote number={4}>
          This is exactly the property Villani (2009) develops at length: the Wasserstein distances metrize weak
          convergence and behave continuously under a much broader class of distributional changes than
          <M>{'\\, f'}</M>-divergences do.
        </Sidenote>
      </p>

      <h2>The problem: that infimum is intractable</h2>

      <p>
        Computing <M>{'W'}</M> directly means optimizing over the space of all couplings &mdash; not something you
        can backpropagate through as written. This is where Kantorovich&ndash;Rubinstein duality earns its keep. For
        the 1-Wasserstein distance specifically, the primal transport problem has a dual formulation over
        1-Lipschitz functions:
      </p>

      <MBlock>{'W(\\mathbb{P}_r, \\mathbb{P}_g) = \\sup_{\\|f\\|_L \\le 1} \\ \\mathbb{E}_{x\\sim\\mathbb{P}_r}[f(x)] - \\mathbb{E}_{x\\sim\\mathbb{P}_g}[f(x)]'}</MBlock>

      <p>
        which is a supremum over a function class rather than an infimum over couplings &mdash; and a function class
        is exactly what a neural network can approximate.<Sidenote number={5}>
          This is the move that makes WGANs practical: replace the discriminator&rsquo;s job (classify real vs. fake)
          with a &ldquo;critic&rdquo;&rsquo;s job (approximate the 1-Lipschitz witness function <M>{'f'}</M> that
          maximizes the gap between the two expectations).
        </Sidenote> Parameterize <M>{'f'}</M> as a neural network <M>{'f_w'}</M>, constrain its Lipschitz constant
        (the original paper clips weights; later work uses a gradient penalty), and the WGAN critic loss falls out
        directly:
      </p>

      <MBlock>{'L(w) = \\mathbb{E}_{x\\sim\\mathbb{P}_r}[f_w(x)] - \\mathbb{E}_{z\\sim p(z)}[f_w(G(z))]'}</MBlock>

      <p>
        The generator&rsquo;s job is simply to minimize this quantity &mdash; push <M>{'f_w(G(z))'}</M> up &mdash;
        while the critic maximizes it subject to the Lipschitz constraint. Because <M>{'W'}</M> is continuous and
        (almost everywhere) differentiable even for disjoint supports, the generator gets a usable gradient
        throughout training, not just near convergence.
      </p>

      <h2>What this buys you in practice</h2>

      <p>
        The loss now correlates with sample quality in a way JS-based GAN loss never reliably did, which is why
        WGAN&rsquo;s critic loss can be watched as a training diagnostic rather than ignored. The cost is enforcing
        the Lipschitz constraint well; weight clipping was a blunt first attempt, and a large share of the
        follow-up literature (gradient penalty, spectral normalization) is really about approximating{' '}
        <M>{'\\|f\\|_L \\le 1'}</M> more faithfully.
      </p>

      <p>
        The throughline worth keeping: instability in the original GAN wasn&rsquo;t a training-trick problem, it was
        a choice-of-divergence problem. Once the objective is a proper metric on distributions with the right
        continuity properties, a lot of the ad hoc stabilization tricks stop being necessary.
      </p>

      <References items={refs} />
    </ArticleLayout>
  );
}
