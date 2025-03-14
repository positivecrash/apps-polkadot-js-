// Copyright 2017-2025 @polkadot/app-treasury authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BountyIndex } from '@polkadot/types/interfaces';

import React, { useEffect, useRef, useState } from 'react';

import { getTreasuryProposalThreshold } from '@polkadot/apps-config';
import { InputAddress, Modal, TxButton } from '@polkadot/react-components';
import { useApi, useCollectiveInstance, useCollectiveMembers } from '@polkadot/react-hooks';
import { BN } from '@polkadot/util';

import { truncateTitle } from '../helpers/index.js';
import { useBounties } from '../hooks/index.js';
import { useTranslation } from '../translate.js';

interface Props {
  description: string;
  index: BountyIndex;
  toggleOpen: () => void;
}

function CloseBounty ({ description, index, toggleOpen }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const { api } = useApi();
  const { members } = useCollectiveMembers('council');
  const councilMod = useCollectiveInstance('council');
  const { closeBounty } = useBounties();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<BN>();

  useEffect((): void => {
    members && setThreshold(
      new BN(Math.ceil(members.length * getTreasuryProposalThreshold(api)))
    );
  }, [api, members]);

  const closeBountyProposal = useRef(closeBounty(index));

  if (!councilMod) {
    return null;
  }

  return (
    <Modal
      header={`${t('close bounty')} - "${truncateTitle(description, 30)}"`}
      onClose={toggleOpen}
      size='large'
    >
      <Modal.Content>
        <Modal.Columns hint={t('The council member that will create the close bounty proposal, submission equates to an "aye" vote.')}>
          <InputAddress
            filter={members}
            label={t('propose with account')}
            onChange={setAccountId}
            type='account'
            withLabel
          />
        </Modal.Columns>
      </Modal.Content>
      <Modal.Actions>
        <TxButton
          accountId={accountId}
          icon='ban'
          isDisabled={false}
          label={t('Close Bounty')}
          onStart={toggleOpen}
          params={[threshold, closeBountyProposal.current, closeBountyProposal.current.length]}
          tx={api.tx[councilMod].propose}
        />
      </Modal.Actions>
    </Modal>
  );
}

export default React.memo(CloseBounty);
