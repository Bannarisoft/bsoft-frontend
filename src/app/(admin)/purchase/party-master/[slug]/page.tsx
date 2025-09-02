import PartyMasterPage from "../../../../../components/organisms/Purchase/PartyMaster/PartyMasterPage";

interface PageParams {
  params: { [key: string]: string };
}

const Page: React.FC<PageParams> = ({ params }) => {
  return (
    <div>
      <PartyMasterPage partyId={params.slug} />
    </div>
  );
};

export default Page;
