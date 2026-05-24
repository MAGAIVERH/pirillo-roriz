import 'dotenv/config';

import { repairAllPortalAccess } from '../src/modules/users/lib/repair-portal-access';

repairAllPortalAccess()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
