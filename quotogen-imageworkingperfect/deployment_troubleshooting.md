# QuoteViral Deployment Troubleshooting Guide

## Common Deployment Issues and Solutions

This document provides guidance on resolving common issues that may occur during the deployment of the QuoteViral platform.

## 1. Cloudflare Account Issues

### Issue: Insufficient Plan Level
- **Error Message**: `Error: Images binding requires a paid Workers plan`
- **Solution**: 
  1. Upgrade Cloudflare account to Workers Paid plan
  2. Verify billing information is correct
  3. Contact Cloudflare support if issue persists

### Issue: Missing Permissions
- **Error Message**: `Error: Unauthorized to access R2/Images/D1`
- **Solution**:
  1. Verify API token has required permissions
  2. Check account has access to R2, Images, and D1 services
  3. Regenerate API token with full permissions

## 2. Wrangler CLI Issues

### Issue: Wrangler Not Found
- **Error Message**: `'wrangler' is not recognized as an internal or external command`
- **Solution**:
  1. Install Wrangler globally: `npm install -g wrangler`
  2. Or install locally: `npm install wrangler --save-dev`
  3. Verify installation: `wrangler --version`

### Issue: Authentication Failure
- **Error Message**: `Error: Failed to authenticate`
- **Solution**:
  1. Run `wrangler login` to authenticate
  2. Verify Cloudflare account credentials
  3. Check if two-factor authentication is required

## 3. Configuration Issues

### Issue: Invalid wrangler.toml
- **Error Message**: `Error: Cannot parse wrangler.toml`
- **Solution**:
  1. Validate TOML syntax using online validator
  2. Check for missing commas or incorrect indentation
  3. Verify all required fields are present

### Issue: Missing Bindings
- **Error Message**: `Error: Binding '[NAME]' not found`
- **Solution**:
  1. Verify binding names match Cloudflare dashboard
  2. Create missing R2 buckets/Images binding/D1 database
  3. Check environment-specific configurations

## 4. Dependency Issues

### Issue: Missing Dependencies
- **Error Message**: `Error: Cannot find module '[MODULE]'`
- **Solution**:
  1. Run `npm install` in both workers and frontend directories
  2. Check package.json for missing dependencies
  3. Clear npm cache: `npm cache clean --force`

### Issue: Version Conflicts
- **Error Message**: `Error: Peer dependency conflict`
- **Solution**:
  1. Check package-lock.json for conflicts
  2. Update conflicting packages to compatible versions
  3. Use `npm ls` to identify dependency tree issues

## 5. Build Issues

### Issue: TypeScript Compilation Errors
- **Error Message**: `Error: TypeScript compilation failed`
- **Solution**:
  1. Check tsconfig.json for correct settings
  2. Verify all TypeScript files have correct syntax
  3. Run `tsc --noEmit` to see detailed errors

### Issue: Vite Build Failure
- **Error Message**: `Error: Build failed with [ERROR]`
- **Solution**:
  1. Check vite.config.ts for correct configuration
  2. Verify all import paths are correct
  3. Check for circular dependencies

## 6. Deployment Issues

### Issue: Deployment Timeout
- **Error Message**: `Error: Deployment timed out`
- **Solution**:
  1. Check internet connection stability
  2. Try deploying during off-peak hours
  3. Break deployment into smaller chunks if possible

### Issue: Script Size Limit Exceeded
- **Error Message**: `Error: Script size limit exceeded`
- **Solution**:
  1. Minimize bundle size by removing unused code
  2. Use code splitting for large dependencies
  3. Optimize images and assets

## 7. Runtime Issues

### Issue: Worker Crashes on Startup
- **Error Message**: `Error: Worker failed to start`
- **Solution**:
  1. Check Cloudflare dashboard for detailed error logs
  2. Verify all environment variables are set
  3. Test locally with `wrangler dev`

### Issue: API Endpoints Return 500
- **Error Message**: `500 Internal Server Error`
- **Solution**:
  1. Check worker logs in Cloudflare dashboard
  2. Verify all bindings are correctly configured
  3. Test endpoint locally with curl or Postman

## 8. R2 Storage Issues

### Issue: Unable to Access R2 Buckets
- **Error Message**: `Error: R2 bucket not found`
- **Solution**:
  1. Verify bucket names in wrangler.toml match Cloudflare dashboard
  2. Check if buckets exist and have correct permissions
  3. Create missing buckets in Cloudflare dashboard

### Issue: Upload Failures
- **Error Message**: `Error: Failed to upload to R2`
- **Solution**:
  1. Check file size limits (5GB per object)
  2. Verify authentication credentials
  3. Check network connectivity

## 9. Cloudflare Images Issues

### Issue: Images Binding Not Working
- **Error Message**: `Error: Images binding not available`
- **Solution**:
  1. Verify account has Images paid plan
  2. Check binding name in wrangler.toml
  3. Restart development server

### Issue: Image Processing Failures
- **Error Message**: `Error: Image processing failed`
- **Solution**:
  1. Check input image format and size
  2. Verify Images API calls have correct parameters
  3. Check for rate limiting

## 10. Frontend Issues

### Issue: Blank Page After Deployment
- **Error Message**: Blank page with no errors
- **Solution**:
  1. Check browser console for JavaScript errors
  2. Verify all assets are loading correctly
  3. Check if API endpoints are accessible

### Issue: CORS Errors
- **Error Message**: `Error: Blocked by CORS policy`
- **Solution**:
  1. Add proper CORS headers to API responses
  2. Verify frontend and backend domains match
  3. Configure CORS settings in Cloudflare dashboard

## 11. DNS and Routing Issues

### Issue: Custom Domain Not Resolving
- **Error Message**: `Error: DNS resolution failed`
- **Solution**:
  1. Verify DNS records in Cloudflare dashboard
  2. Check if domain is properly pointed to Cloudflare nameservers
  3. Allow time for DNS propagation (up to 24 hours)

### Issue: SSL Certificate Not Provisioning
- **Error Message**: `Error: SSL certificate provisioning failed`
- **Solution**:
  1. Check domain ownership verification
  2. Verify DNS records are correct
  3. Contact Cloudflare support if issue persists

## 12. Asset Deployment Issues

### Issue: Asset Upload Failures
- **Error Message**: `Error: Failed to upload assets`
- **Solution**:
  1. Check file permissions
  2. Verify file sizes are within limits
  3. Check network connectivity

### Issue: Assets Not Accessible
- **Error Message**: `Error: 404 Not Found for asset`
- **Solution**:
  1. Verify asset URLs are correct
  2. Check R2 bucket permissions
  3. Ensure assets were uploaded to correct location

## Emergency Procedures

### Immediate Rollback
If deployment causes critical issues:
1. Use `wrangler versions view` to see deployed versions
2. Use `wrangler versions deploy` to rollback to previous version
3. Document issue and resolution steps
4. Investigate root cause before redeploying

### Contact Support
For issues that cannot be resolved:
1. Gather all error messages and logs
2. Prepare detailed description of the issue
3. Contact Cloudflare support with:
   - Account ID
   - Zone ID
   - Worker name
   - Error messages
   - Timestamps
   - Recent changes made

## Prevention Best Practices

1. **Always test locally** before deploying to production
2. **Backup current deployment** before making changes
3. **Deploy during off-peak hours** to minimize user impact
4. **Monitor logs closely** after deployment
5. **Have a rollback plan** ready before deployment
6. **Document all changes** for future reference
7. **Verify all environment variables** before deployment
8. **Test all API endpoints** after deployment