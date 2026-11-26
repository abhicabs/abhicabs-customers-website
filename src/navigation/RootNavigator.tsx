import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../auth/AuthContext';
import { colors } from '../theme/theme';
import type { AuthStackParamList, AppStackParamList } from './types';

import { SplashScreen } from '../screens/SplashScreen';
import { LoginMobileScreen } from '../screens/LoginMobileScreen';
import { LoginOtpScreen } from '../screens/LoginOtpScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LeadsScreen } from '../screens/LeadsScreen';
import { LeadDetailScreen } from '../screens/LeadDetailScreen';
import { LeadAddScreen } from '../screens/LeadAddScreen';
import { LeadStatusScreen } from '../screens/LeadStatusScreen';
import { PolicyHoldersScreen } from '../screens/PolicyHoldersScreen';
import { PolicyHolderDetailScreen } from '../screens/PolicyHolderDetailScreen';
import { QuotesScreen } from '../screens/QuotesScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { ComingSoonScreen } from '../screens/ComingSoonScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { RenewalsScreen } from '../screens/RenewalsScreen';
import { LeadMoreActionsScreen } from '../screens/LeadMoreActionsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PoliciesScreen } from '../screens/PoliciesScreen';
import { ProposalsScreen } from '../screens/ProposalsScreen';
import { RenewalDetailScreen } from '../screens/RenewalDetailScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { PolicyHolderFamilyScreen } from '../screens/PolicyHolderFamilyScreen';
import { PolicyHolderConsentScreen } from '../screens/PolicyHolderConsentScreen';
import { PolicyHolderDocumentsScreen } from '../screens/PolicyHolderDocumentsScreen';
import { PolicyHolderQuotesScreen } from '../screens/PolicyHolderQuotesScreen';
import { PolicyHolderPoliciesScreen } from '../screens/PolicyHolderPoliciesScreen';
import { PolicyHolderActivityScreen } from '../screens/PolicyHolderActivityScreen';
import { PolicyHolderPaymentsScreen } from '../screens/PolicyHolderPaymentsScreen';
import { PolicyHolderRenewalsScreen } from '../screens/PolicyHolderRenewalsScreen';
import { PolicyHolderVehiclesScreen } from '../screens/PolicyHolderVehiclesScreen';
import { CommunicationsScreen } from '../screens/CommunicationsScreen';
import { MessageDetailScreen } from '../screens/MessageDetailScreen';
import { CampaignDetailScreen } from '../screens/CampaignDetailScreen';
import { HowBadgesWorkScreen } from '../screens/HowBadgesWorkScreen';
import { ComparisonBuilderScreen } from '../screens/ComparisonBuilderScreen';
import { AccountBlockedScreen } from '../screens/AccountBlockedScreen';
import { AdminHomeScreen } from '../screens/AdminHomeScreen';
import { AdminApprovalsScreen } from '../screens/AdminApprovalsScreen';
import { ApproveOtpScreen } from '../screens/ApproveOtpScreen';
import { AdminAdvisorsScreen } from '../screens/AdminAdvisorsScreen';
import { AdminAccountDetailScreen } from '../screens/AdminAccountDetailScreen';
import { AdminKycScreen } from '../screens/AdminKycScreen';
import { AdminCatalogueScreen } from '../screens/AdminCatalogueScreen';
import { AdminTemplatesScreen } from '../screens/AdminTemplatesScreen';
import { AdminMoreScreen } from '../screens/AdminMoreScreen';
import { AgentCodeFlagsScreen } from '../screens/AgentCodeFlagsScreen';
import { AdminAuditScreen } from '../screens/AdminAuditScreen';
import { AdminCorrectionsScreen } from '../screens/AdminCorrectionsScreen';
import { SuspendAccountScreen } from '../screens/SuspendAccountScreen';
import { RecordSubPaymentScreen } from '../screens/RecordSubPaymentScreen';
import { AdminUsersScreen } from '../screens/AdminUsersScreen';
import { AdminConfigScreen } from '../screens/AdminConfigScreen';
import { AdminSupportScreen } from '../screens/AdminSupportScreen';
import { LogContactScreen } from '../screens/LogContactScreen';
import { ConvertLeadScreen } from '../screens/ConvertLeadScreen';
import { MarkLostScreen } from '../screens/MarkLostScreen';
import { EditLeadScreen } from '../screens/EditLeadScreen';
import { ReopenLeadScreen } from '../screens/ReopenLeadScreen';
import { RecordConsentScreen } from '../screens/RecordConsentScreen';
import { WithdrawConsentScreen } from '../screens/WithdrawConsentScreen';
import { FamilyMemberFormScreen } from '../screens/FamilyMemberFormScreen';
import { RenewalLogContactScreen } from '../screens/RenewalLogContactScreen';
import { RenewalNotRenewingScreen } from '../screens/RenewalNotRenewingScreen';
import { RescheduleTaskScreen } from '../screens/RescheduleTaskScreen';
import { DocumentVersionsScreen } from '../screens/DocumentVersionsScreen';
import { ChangeLabelScreen } from '../screens/ChangeLabelScreen';
import { CheckValuesScreen } from '../screens/CheckValuesScreen';
import { RenewalSameQuoteScreen } from '../screens/RenewalSameQuoteScreen';
import { RenewalNewQuoteScreen } from '../screens/RenewalNewQuoteScreen';
import { AddPolicyHolderScreen } from '../screens/AddPolicyHolderScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { LeadsBoardScreen } from '../screens/LeadsBoardScreen';
import { EditPolicyHolderScreen } from '../screens/EditPolicyHolderScreen';
import { PolicyHolderActionsScreen } from '../screens/PolicyHolderActionsScreen';
import { ChangeNomineeScreen } from '../screens/ChangeNomineeScreen';
import { QuoteActionsScreen } from '../screens/QuoteActionsScreen';
import { PolicyActionsScreen } from '../screens/PolicyActionsScreen';
import { LinkPolicyHolderScreen } from '../screens/LinkPolicyHolderScreen';
import { ProductPriceVersionsScreen } from '../screens/ProductPriceVersionsScreen';
import { ComparisonDetailScreen } from '../screens/ComparisonDetailScreen';
import { SuggestCorrectionScreen } from '../screens/SuggestCorrectionScreen';
import { CancelScheduledScreen } from '../screens/CancelScheduledScreen';
import { FiltersScreen } from '../screens/FiltersScreen';
import { AddPriceVersionScreen } from '../screens/AddPriceVersionScreen';
import { UploadSourceScreen } from '../screens/UploadSourceScreen';
import { DateTimePickerScreen } from '../screens/DateTimePickerScreen';
import { LeadSourcePickerScreen } from '../screens/LeadSourcePickerScreen';
import { AddVehicleScreen } from '../screens/AddVehicleScreen';
import { IntegrationsScreen } from '../screens/IntegrationsScreen';
import { MessageRulesScreen } from '../screens/MessageRulesScreen';
import { ComparisonsListScreen } from '../screens/ComparisonsListScreen';
import { RecordExistingPolicyScreen } from '../screens/RecordExistingPolicyScreen';
import { CampaignSetupScreen } from '../screens/CampaignSetupScreen';
import { AdminProductDetailScreen } from '../screens/AdminProductDetailScreen';
import { PersonFormScreen } from '../screens/PersonFormScreen';
import { AddInsurerScreen } from '../screens/AddInsurerScreen';
import { GiveAccessScreen } from '../screens/GiveAccessScreen';
import { EditNomineesScreen } from '../screens/EditNomineesScreen';
import { CorrectPolicyScreen } from '../screens/CorrectPolicyScreen';
import { EditCommercialsScreen } from '../screens/EditCommercialsScreen';
import { GreetingsScreen } from '../screens/GreetingsScreen';
import { RemarksScreen } from '../screens/RemarksScreen';
import { CampaignConnectScreen } from '../screens/CampaignConnectScreen';
import { BrochureReadingScreen } from '../screens/BrochureReadingScreen';
import { DocumentsAllScreen } from '../screens/DocumentsAllScreen';
import { QuoteDetailScreen } from '../screens/QuoteDetailScreen';
import { PolicyDetailScreen } from '../screens/PolicyDetailScreen';
import { AddTaskScreen } from '../screens/AddTaskScreen';
import { QuoteShareScreen } from '../screens/QuoteShareScreen';
import { HowToRenewScreen } from '../screens/HowToRenewScreen';
import { QuoteBuilderScreen } from '../screens/QuoteBuilderScreen';
import { ProposalDetailScreen } from '../screens/ProposalDetailScreen';
import { RecordPaymentScreen } from '../screens/RecordPaymentScreen';
import { RecordIssuedScreen } from '../screens/RecordIssuedScreen';
import { AddDocumentScreen } from '../screens/AddDocumentScreen';
import { CampaignsScreen } from '../screens/CampaignsScreen';
import { CampaignLeadsScreen } from '../screens/CampaignLeadsScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CompareVariantsScreen } from '../screens/CompareVariantsScreen';
import { FeatureTableScreen } from '../screens/FeatureTableScreen';
import { BestFitScreen } from '../screens/BestFitScreen';
import { BestFitResultsScreen } from '../screens/BestFitResultsScreen';
import { NewFromSkyUpScreen } from '../screens/NewFromSkyUpScreen';
import { AddProductScreen } from '../screens/AddProductScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PlanBillingScreen } from '../screens/PlanBillingScreen';
import { KycScreen } from '../screens/KycScreen';
import { SecurityScreen } from '../screens/SecurityScreen';
import { ActivityLogScreen } from '../screens/ActivityLogScreen';
import { MyInsurersScreen } from '../screens/MyInsurersScreen';
import { AssistantsScreen } from '../screens/AssistantsScreen';
import { ReferrersScreen } from '../screens/ReferrersScreen';
import { WalletScreen } from '../screens/WalletScreen';
import { SupportAccessScreen } from '../screens/SupportAccessScreen';
import { ExportDataScreen } from '../screens/ExportDataScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.blue },
};

function AuthFlow() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <AuthStack.Screen name="LoginMobile" component={LoginMobileScreen} />
      <AuthStack.Screen name="LoginOtp" component={LoginOtpScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function AppFlow() {
  const { user } = useAuth();
  const staffHome = user?.role === 'ADM' || user?.role === 'STF';
  return (
    <AppStack.Navigator initialRouteName={staffHome ? 'AdminHome' : 'Home'} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <AppStack.Screen name="Home" component={HomeScreen} />
      <AppStack.Screen name="Leads" component={LeadsScreen} />
      <AppStack.Screen name="LeadDetail" component={LeadDetailScreen} />
      <AppStack.Screen name="LeadAdd" component={LeadAddScreen} />
      <AppStack.Screen name="PolicyHolders" component={PolicyHoldersScreen} />
      <AppStack.Screen name="PolicyHolderDetail" component={PolicyHolderDetailScreen} />
      <AppStack.Screen name="Quotes" component={QuotesScreen} />
      <AppStack.Screen name="More" component={MoreScreen} />
      <AppStack.Screen name="ComingSoon" component={ComingSoonScreen} />
      <AppStack.Screen name="Tasks" component={TasksScreen} />
      <AppStack.Screen name="Notifications" component={NotificationsScreen} />
      <AppStack.Screen name="Renewals" component={RenewalsScreen} />
      <AppStack.Screen name="Settings" component={SettingsScreen} />
      <AppStack.Screen name="Policies" component={PoliciesScreen} />
      <AppStack.Screen name="Proposals" component={ProposalsScreen} />
      <AppStack.Screen name="RenewalDetail" component={RenewalDetailScreen} />
      <AppStack.Screen name="Products" component={ProductsScreen} />
      <AppStack.Screen name="Campaigns" component={CampaignsScreen} />
      <AppStack.Screen name="CampaignLeads" component={CampaignLeadsScreen} />
      <AppStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <AppStack.Screen name="CompareVariants" component={CompareVariantsScreen} />
      <AppStack.Screen name="FeatureTable" component={FeatureTableScreen} />
      <AppStack.Screen name="BestFit" component={BestFitScreen} />
      <AppStack.Screen name="BestFitResults" component={BestFitResultsScreen} />
      <AppStack.Screen name="NewFromSkyUp" component={NewFromSkyUpScreen} />
      <AppStack.Screen name="AddProduct" component={AddProductScreen} />
      <AppStack.Screen name="Profile" component={ProfileScreen} />
      <AppStack.Screen name="PlanBilling" component={PlanBillingScreen} />
      <AppStack.Screen name="Kyc" component={KycScreen} />
      <AppStack.Screen name="Security" component={SecurityScreen} />
      <AppStack.Screen name="ActivityLog" component={ActivityLogScreen} />
      <AppStack.Screen name="MyInsurers" component={MyInsurersScreen} />
      <AppStack.Screen name="Assistants" component={AssistantsScreen} />
      <AppStack.Screen name="Referrers" component={ReferrersScreen} />
      <AppStack.Screen name="Wallet" component={WalletScreen} />
      <AppStack.Screen name="SupportAccess" component={SupportAccessScreen} />
      <AppStack.Screen name="ExportData" component={ExportDataScreen} />
      <AppStack.Screen name="PolicyHolderFamily" component={PolicyHolderFamilyScreen} />
      <AppStack.Screen name="PolicyHolderConsent" component={PolicyHolderConsentScreen} />
      <AppStack.Screen name="PolicyHolderDocuments" component={PolicyHolderDocumentsScreen} />
      <AppStack.Screen name="PolicyHolderQuotes" component={PolicyHolderQuotesScreen} />
      <AppStack.Screen name="PolicyHolderPolicies" component={PolicyHolderPoliciesScreen} />
      <AppStack.Screen name="PolicyHolderActivity" component={PolicyHolderActivityScreen} />
      <AppStack.Screen name="PolicyHolderPayments" component={PolicyHolderPaymentsScreen} />
      <AppStack.Screen name="PolicyHolderRenewals" component={PolicyHolderRenewalsScreen} />
      <AppStack.Screen name="PolicyHolderVehicles" component={PolicyHolderVehiclesScreen} />
      <AppStack.Screen name="Communications" component={CommunicationsScreen} />
      <AppStack.Screen name="MessageDetail" component={MessageDetailScreen} />
      <AppStack.Screen name="CampaignDetail" component={CampaignDetailScreen} />
      <AppStack.Screen name="HowBadgesWork" component={HowBadgesWorkScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="ComparisonBuilder" component={ComparisonBuilderScreen} />
      <AppStack.Screen name="AccountBlocked" component={AccountBlockedScreen} />
      <AppStack.Screen name="AdminHome" component={AdminHomeScreen} />
      <AppStack.Screen name="AdminApprovals" component={AdminApprovalsScreen} />
      <AppStack.Screen name="ApproveOtp" component={ApproveOtpScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="AdminAdvisors" component={AdminAdvisorsScreen} />
      <AppStack.Screen name="AdminAccountDetail" component={AdminAccountDetailScreen} />
      <AppStack.Screen name="AdminKyc" component={AdminKycScreen} />
      <AppStack.Screen name="AdminCatalogue" component={AdminCatalogueScreen} />
      <AppStack.Screen name="AdminTemplates" component={AdminTemplatesScreen} />
      <AppStack.Screen name="AdminMore" component={AdminMoreScreen} />
      <AppStack.Screen name="AgentCodeFlags" component={AgentCodeFlagsScreen} />
      <AppStack.Screen name="AdminAudit" component={AdminAuditScreen} />
      <AppStack.Screen name="AdminCorrections" component={AdminCorrectionsScreen} />
      <AppStack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <AppStack.Screen name="AdminConfig" component={AdminConfigScreen} />
      <AppStack.Screen name="AdminSupport" component={AdminSupportScreen} />
      <AppStack.Screen name="LogContact" component={LogContactScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="ConvertLead" component={ConvertLeadScreen} />
      <AppStack.Screen name="MarkLost" component={MarkLostScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="EditLead" component={EditLeadScreen} />
      <AppStack.Screen name="ReopenLead" component={ReopenLeadScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="RecordConsent" component={RecordConsentScreen} />
      <AppStack.Screen name="WithdrawConsent" component={WithdrawConsentScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="FamilyMemberForm" component={FamilyMemberFormScreen} />
      <AppStack.Screen name="RenewalLogContact" component={RenewalLogContactScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="RenewalNotRenewing" component={RenewalNotRenewingScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="RescheduleTask" component={RescheduleTaskScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="DocumentVersions" component={DocumentVersionsScreen} />
      <AppStack.Screen name="CheckValues" component={CheckValuesScreen} />
      <AppStack.Screen name="RenewalSameQuote" component={RenewalSameQuoteScreen} />
      <AppStack.Screen name="RenewalNewQuote" component={RenewalNewQuoteScreen} />
      <AppStack.Screen name="AddPolicyHolder" component={AddPolicyHolderScreen} />
      <AppStack.Screen name="Search" component={SearchScreen} />
      <AppStack.Screen name="LeadsBoard" component={LeadsBoardScreen} />
      <AppStack.Screen name="EditPolicyHolder" component={EditPolicyHolderScreen} />
      <AppStack.Screen name="PolicyHolderActions" component={PolicyHolderActionsScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="ChangeNominee" component={ChangeNomineeScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="QuoteActions" component={QuoteActionsScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="PolicyActions" component={PolicyActionsScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="LinkPolicyHolder" component={LinkPolicyHolderScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="ProductPriceVersions" component={ProductPriceVersionsScreen} />
      <AppStack.Screen name="ComparisonDetail" component={ComparisonDetailScreen} />
      <AppStack.Screen name="SuggestCorrection" component={SuggestCorrectionScreen} />
      <AppStack.Screen name="CancelScheduled" component={CancelScheduledScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="Filters" component={FiltersScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="AddPriceVersion" component={AddPriceVersionScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="UploadSource" component={UploadSourceScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="DateTimePicker" component={DateTimePickerScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="LeadSourcePicker" component={LeadSourcePickerScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="AddVehicle" component={AddVehicleScreen} />
      <AppStack.Screen name="Integrations" component={IntegrationsScreen} />
      <AppStack.Screen name="MessageRules" component={MessageRulesScreen} />
      <AppStack.Screen name="ComparisonsList" component={ComparisonsListScreen} />
      <AppStack.Screen name="RecordExistingPolicy" component={RecordExistingPolicyScreen} />
      <AppStack.Screen name="CampaignSetup" component={CampaignSetupScreen} />
      <AppStack.Screen name="AdminProductDetail" component={AdminProductDetailScreen} />
      <AppStack.Screen name="PersonForm" component={PersonFormScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="AddInsurer" component={AddInsurerScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="GiveAccess" component={GiveAccessScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="EditNominees" component={EditNomineesScreen} />
      <AppStack.Screen name="CorrectPolicy" component={CorrectPolicyScreen} />
      <AppStack.Screen name="EditCommercials" component={EditCommercialsScreen} />
      <AppStack.Screen name="Greetings" component={GreetingsScreen} />
      <AppStack.Screen name="Remarks" component={RemarksScreen} />
      <AppStack.Screen name="CampaignConnect" component={CampaignConnectScreen} />
      <AppStack.Screen name="BrochureReading" component={BrochureReadingScreen} />
      <AppStack.Screen name="DocumentsAll" component={DocumentsAllScreen} />
      <AppStack.Screen name="ChangeLabel" component={ChangeLabelScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="SuspendAccount" component={SuspendAccountScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="RecordSubPayment" component={RecordSubPaymentScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="QuoteDetail" component={QuoteDetailScreen} />
      <AppStack.Screen name="QuoteBuilder" component={QuoteBuilderScreen} />
      <AppStack.Screen name="ProposalDetail" component={ProposalDetailScreen} />
      <AppStack.Screen name="RecordPayment" component={RecordPaymentScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="RecordIssued" component={RecordIssuedScreen} />
      <AppStack.Screen name="AddDocument" component={AddDocumentScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="PolicyDetail" component={PolicyDetailScreen} />
      <AppStack.Screen name="AddTask" component={AddTaskScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="QuoteShare" component={QuoteShareScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen name="HowToRenew" component={HowToRenewScreen} options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }} />
      <AppStack.Screen
        name="LeadMoreActions"
        component={LeadMoreActionsScreen}
        options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }}
      />
      <AppStack.Screen
        name="LeadStatus"
        component={LeadStatusScreen}
        options={{ presentation: 'transparentModal', animation: 'fade', contentStyle: { backgroundColor: 'transparent' } }}
      />
    </AppStack.Navigator>
  );
}

export function RootNavigator() {
  const { status } = useAuth();
  if (status === 'loading') return <SplashScreen />;
  return (
    <NavigationContainer theme={navTheme}>
      {status === 'signedIn' ? <AppFlow /> : <AuthFlow />}
    </NavigationContainer>
  );
}
