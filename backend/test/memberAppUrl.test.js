import test from "node:test";
import assert from "node:assert/strict";
import { getMemberAppBaseUrl } from "../src/utils/memberAppUrl.js";
import { buildWelcomeCredentialsEmailContent } from "../src/services/emailService.js";

const withUrls = (memberAppBaseUrl, frontendOrigin, callback) => {
  const previousMemberAppBaseUrl = process.env.MEMBER_APP_BASE_URL;
  const previousFrontendOrigin = process.env.FRONTEND_ORIGIN;
  process.env.MEMBER_APP_BASE_URL = memberAppBaseUrl;
  process.env.FRONTEND_ORIGIN = frontendOrigin;
  try {
    callback();
  } finally {
    if (previousMemberAppBaseUrl === undefined) delete process.env.MEMBER_APP_BASE_URL;
    else process.env.MEMBER_APP_BASE_URL = previousMemberAppBaseUrl;
    if (previousFrontendOrigin === undefined) delete process.env.FRONTEND_ORIGIN;
    else process.env.FRONTEND_ORIGIN = previousFrontendOrigin;
  }
};

test("member app URL prefers MEMBER_APP_BASE_URL and the welcome email uses it for both login links", () => {
  withUrls("https://member.example.test/", "https://frontend.example.test", () => {
    assert.equal(getMemberAppBaseUrl(), "https://member.example.test");
    const { memberHtml } = buildWelcomeCredentialsEmailContent({
      toEmail: "member@example.test", fullName: "Test Member", memberId: "VC-FM-00001", tempPassword: "temporary-password",
    });
    assert.equal((memberHtml.match(/https:\/\/member\.example\.test\/login/g) || []).length, 3);
    assert.doesNotMatch(memberHtml, /frontend\.example\.test/);
  });
});

test("member app URL falls back to FRONTEND_ORIGIN, then localhost, when public URL is blank", () => {
  withUrls("   ", "https://frontend.example.test/", () => assert.equal(getMemberAppBaseUrl(), "https://frontend.example.test"));
  withUrls("", " ", () => assert.equal(getMemberAppBaseUrl(), "http://localhost:5173"));
});
