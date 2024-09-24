import { getUser } from '@/code/auth';
import { withAuthorization, withMethodHandler } from '@/middleware/withAuthorization';
import { withPrisma } from '@/middleware/withPrisma';
import { Role } from '@prisma/client';

const post = async (req, res, prisma) => {

    const { selectedOrganization } = req.body;

    const user = await getUser(req, res);

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // check if the selected organization is in the list of organizations
    if (!user.organizations.includes(selectedOrganization)) {
        return res.status(400).json({ error: 'Invalid organization' });
    }

    // Update the user in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { selectedOrganization },
    });

    return res.status(200).json({ data: { selectedOrganization } });
}


export default withMethodHandler({
    POST: withAuthorization(withPrisma(post), [Role.STUDENT, Role.PROFESSOR, Role.SUPER_ADMIN]),
})
  