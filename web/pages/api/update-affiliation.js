import { getUser } from '@/code/auth';
import { withAuthorization, withMethodHandler } from '@/middleware/withAuthorization';
import { withPrisma } from '@/middleware/withPrisma';
import { Role } from '@prisma/client';

const post = async (req, res, prisma) => {

    const { selectedAffiliation } = req.body;

    const user = await getUser(req, res);

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // check if the selected affiliation is in the list of affiliations
    if (!user.affiliations.includes(selectedAffiliation)) {
        return res.status(400).json({ error: 'Invalid affiliation' });
    }

    // Update the user in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { selectedAffiliation },
    });

    return res.status(200).json({ data: { selectedAffiliation } });
   
}


export default withMethodHandler({
    POST: withAuthorization(withPrisma(post), [Role.STUDENT, Role.PROFESSOR, Role.SUPER_ADMIN]),
})
  