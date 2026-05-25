import type { Meta, StoryObj } from '@storybook/react-native';
import { StyleSheet, View } from 'react-native';

import { StorybookScreen } from '../../src/storybook/decorators/StorybookScreen';
import {
  ownerAndGuestsMembers,
  ownerOnlyMembers,
  ownerWithManualMembers,
} from '../../src/storybook/mocks/roomMocks';
import type { RoomMember } from '../../src/types/roomTypes';
import { MembersCard } from '../../src/views/components/room/MembersCard';

const mockActions = {
  onTransferOwnership: (member: RoomMember) =>
    console.log('Mock: transferir dono para', member),

  onRemoveMember: (member: RoomMember) =>
    console.log('Mock: remover membro', member),
};

const baseArgs = {
  members: ownerAndGuestsMembers,
  currentMemberId: 'member-current',
  isLoadingMembers: false,
  membersError: null,
  isOwner: false,
  isRoomClosed: false,
  isChangingMember: false,
  ...mockActions,
};

const meta = {
  title: 'Room/MembersCard',
  component: MembersCard,
  decorators: [
    (Story) => (
      <StorybookScreen>
        <Story />
      </StorybookScreen>
    ),
  ],
  args: baseArgs,
  argTypes: {
    currentMemberId: {
      control: 'text',
    },
    isLoadingMembers: {
      control: 'boolean',
    },
    membersError: {
      control: 'text',
    },
    isOwner: {
      control: 'boolean',
    },
    isRoomClosed: {
      control: 'boolean',
    },
    isChangingMember: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof MembersCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OwnerOnly: Story = {
  name: 'Só dono',
  args: {
    ...baseArgs,
    members: ownerOnlyMembers,
    currentMemberId: 'member-owner',
    isOwner: true,
  },
};

export const OwnerAndGuests: Story = {
  name: 'Dono + convidados',
  args: {
    ...baseArgs,
    members: ownerAndGuestsMembers,
    currentMemberId: 'member-current',
    isOwner: false,
  },
};

export const GuestViewingList: Story = {
  name: 'Convidado vendo lista',
  args: {
    ...baseArgs,
    members: ownerAndGuestsMembers,
    currentMemberId: 'member-current',
    isOwner: false,
  },
};

export const OwnerManagingMembers: Story = {
  name: 'Dono com ações',
  args: {
    ...baseArgs,
    members: ownerAndGuestsMembers,
    currentMemberId: 'member-owner',
    isOwner: true,
  },
};

export const OwnerManagingManualMember: Story = {
  name: 'Dono com pessoa manual',
  args: {
    ...baseArgs,
    members: ownerWithManualMembers,
    currentMemberId: 'member-owner',
    isOwner: true,
  },
};

export const CurrentUserMarked: Story = {
  name: 'Usuário atual marcado com Você',
  args: {
    ...baseArgs,
    members: ownerAndGuestsMembers,
    currentMemberId: 'member-current',
    isOwner: false,
  },
};

export const Loading: Story = {
  name: 'Carregando membros',
  args: {
    ...baseArgs,
    members: [],
    isLoadingMembers: true,
  },
};

export const ErrorState: Story = {
  name: 'Erro',
  args: {
    ...baseArgs,
    members: [],
    membersError: 'Não foi possível carregar os membros da sala.',
  },
};

export const EmptyMembers: Story = {
  name: 'Lista vazia',
  args: {
    ...baseArgs,
    members: [],
    currentMemberId: '',
  },
};

export const ClosedRoomAsOwner: Story = {
  name: 'Sala encerrada como dono',
  args: {
    ...baseArgs,
    members: ownerAndGuestsMembers,
    currentMemberId: 'member-owner',
    isOwner: true,
    isRoomClosed: true,
  },
};

export const ChangingMember: Story = {
  name: 'Dono alterando membro',
  args: {
    ...baseArgs,
    members: ownerAndGuestsMembers,
    currentMemberId: 'member-owner',
    isOwner: true,
    isChangingMember: true,
  },
};

export const AllMemberStates: Story = {
  name: 'Todos os estados principais',
  render: () => (
    <View style={styles.stack}>
      <MembersCard
        {...baseArgs}
        members={ownerOnlyMembers}
        currentMemberId="member-owner"
        isOwner
      />

      <MembersCard
        {...baseArgs}
        members={ownerAndGuestsMembers}
        currentMemberId="member-current"
      />

      <MembersCard
        {...baseArgs}
        members={ownerAndGuestsMembers}
        currentMemberId="member-owner"
        isOwner
      />

      <MembersCard
        {...baseArgs}
        members={ownerWithManualMembers}
        currentMemberId="member-owner"
        isOwner
      />

      <MembersCard
        {...baseArgs}
        members={[]}
        isLoadingMembers
      />

      <MembersCard
        {...baseArgs}
        members={[]}
        membersError="Não foi possível carregar os membros da sala."
      />

      <MembersCard
        {...baseArgs}
        members={ownerAndGuestsMembers}
        currentMemberId="member-owner"
        isOwner
        isRoomClosed
      />
    </View>
  ),
};

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
});