import { Text } from "./ui/text";

export function SettingsNotConfigured() {
  return (
    <div className="w-full h-full grid place-items-center">
      <div className="text-center space-y-4">
        <Text variant="h3" className="text-muted-foreground">
          Configuration Required
        </Text>
        <Text variant="p" className="text-muted-foreground">
          Please click Settings in the sidebar to configure the A2A client.
        </Text>
      </div>
    </div>
  );
}