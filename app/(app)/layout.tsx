import Menu from "@/components/Menu";

const AppLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <Menu />
      {children}
    </>
  );
};

export default AppLayout;
